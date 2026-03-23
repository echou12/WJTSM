// app/api/players/[id]/blacklist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/players/:id/blacklist - Toggle blacklist
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { blacklist, note } = body

  const player = await prisma.player.update({
    where: { id },
    data: {
      isBlacklisted: blacklist,
      blacklistNote: blacklist ? note : null,
      status: blacklist ? 'blacklisted' : 'inactive',
    },
  })

  return NextResponse.json({ data: player })
}
