// app/api/groups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  consultantId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      consultant: { select: { id: true, name: true } },
      players: {
        include: {
          transfers: { select: { type: true, amount: true, transferAt: true } },
        },
      },
    },
  })

  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: group })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const group = await prisma.group.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ data: group })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.group.delete({ where: { id } })
  return NextResponse.json({ message: 'Grupo excluído' })
}
