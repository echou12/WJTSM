// app/api/transfers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { TransferType } from '@prisma/client'

const createSchema = z.object({
  playerId: z.string(),
  type: z.nativeEnum(TransferType),
  amount: z.number().positive(),
  currency: z.string().default('BRL'),
  houseProfit: z.number().optional(),
  note: z.string().optional(),
  transferAt: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const playerId = searchParams.get('playerId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: Record<string, unknown> = {}
  if (playerId) where.playerId = playerId
  if (startDate || endDate) {
    where.transferAt = {}
    if (startDate) (where.transferAt as Record<string, unknown>).gte = new Date(startDate)
    if (endDate) (where.transferAt as Record<string, unknown>).lte = new Date(endDate)
  }

  const transfers = await prisma.transfer.findMany({
    where,
    include: { player: { select: { name: true } } },
    orderBy: { transferAt: 'desc' },
  })

  const result = transfers.map(t => ({
    ...t,
    playerName: t.player.name,
    player: undefined,
  }))

  return NextResponse.json({ data: result })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { transferAt, ...rest } = parsed.data
  const transfer = await prisma.transfer.create({
    data: { ...rest, transferAt: transferAt ? new Date(transferAt) : new Date() },
  })

  return NextResponse.json({ data: transfer }, { status: 201 })
}
