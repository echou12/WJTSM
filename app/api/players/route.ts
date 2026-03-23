// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { PlayerStatus } from '@prisma/client'

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  status: z.nativeEnum(PlayerStatus).optional(),
  vipLevel: z.number().int().min(0).max(10).optional(),
  groupId: z.string().optional(),
  consultantId: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/players
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const groupId = searchParams.get('groupId') || ''
  const consultantId = searchParams.get('consultantId') || ''

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (groupId) where.groupId = groupId
  if (consultantId) where.consultantId = consultantId

  // Consultants only see their own players
  if (session.user.role === 'consultant') {
    where.consultantId = session.user.id
  }

  const players = await prisma.player.findMany({
    where,
    include: {
      group: { select: { id: true, name: true } },
      consultant: { select: { id: true, name: true } },
      transfers: {
        select: { type: true, amount: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate transfer totals
  const result = players.map(p => ({
    ...p,
    groupName: p.group?.name,
    consultantName: p.consultant?.name,
    totalDeposit: p.transfers.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
    totalWithdrawal: p.transfers.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
    transfers: undefined,
    group: undefined,
    consultant: undefined,
  }))

  return NextResponse.json({ data: result })
}

// POST /api/players
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = { ...parsed.data }
  if (!data.email) delete data.email

  const player = await prisma.player.create({ data: data as any })
  return NextResponse.json({ data: player }, { status: 201 })
}
