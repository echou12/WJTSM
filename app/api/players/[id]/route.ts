// app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { PlayerStatus } from '@prisma/client'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  status: z.nativeEnum(PlayerStatus).optional(),
  vipLevel: z.number().int().min(0).max(10).optional(),
  groupId: z.string().nullable().optional(),
  consultantId: z.string().nullable().optional(),
  notes: z.string().optional(),
  isBlacklisted: z.boolean().optional(),
  blacklistNote: z.string().optional(),
})

// GET /api/players/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
      consultant: { select: { id: true, name: true } },
      transfers: { orderBy: { transferAt: 'desc' } },
      contacts: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: player })
}

// PATCH /api/players/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const player = await prisma.player.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ data: player })
}

// DELETE /api/players/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['superadmin', 'admin', 'manager'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.player.delete({ where: { id } })
  return NextResponse.json({ message: 'Jogador excluído' })
}
