// app/api/groups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  consultantId: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groups = await prisma.group.findMany({
    include: {
      consultant: { select: { id: true, name: true } },
      _count: { select: { players: true } },
      players: {
        include: { transfers: { select: { type: true, amount: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = groups.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    consultantId: g.consultantId,
    consultantName: g.consultant?.name,
    playerCount: g._count.players,
    isActive: g.isActive,
    createdAt: g.createdAt,
    totalDeposits: g.players.flatMap(p => p.transfers).filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
    totalWithdrawals: g.players.flatMap(p => p.transfers).filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
  }))

  return NextResponse.json({ data: result })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const group = await prisma.group.create({ data: parsed.data })
  return NextResponse.json({ data: group }, { status: 201 })
}
