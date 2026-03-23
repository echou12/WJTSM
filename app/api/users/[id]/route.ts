// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

// PATCH /api/users/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12)
  } else {
    delete updateData.password
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })

  return NextResponse.json({ data: user })
}

// DELETE /api/users/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  // Prevent deleting self
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: 'Usuário excluído' })
}
