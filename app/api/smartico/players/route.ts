// app/api/smartico/players/route.ts
// Returns local players enriched with Smartico live activity
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { fetchTodayFinancialEvents, aggregateByPlayer } from '@/lib/smartico'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')

  // Fetch Smartico events for date range
  let byPlayer = new Map<string, any>()
  try {
    const { fetchEvents, aggregateByPlayer: agg } = await import('@/lib/smartico')
    const from = fromStr ? new Date(fromStr) : (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
    const to = toStr ? new Date(toStr) : new Date()
    const result = await fetchEvents({ from, to, event_types: ['deposit', 'withdrawal'] })
    byPlayer = agg(result.events)
  } catch (err) {
    console.warn('[smartico/players] Smartico unavailable:', err)
  }

  // Get all local players
  const players = await prisma.player.findMany({
    include: {
      group: { select: { name: true } },
      consultant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with Smartico data
  const enriched = players.map(p => {
    const s = p.smarticoId ? byPlayer.get(p.smarticoId) : null
    return {
      id: p.id,
      smarticoId: p.smarticoId,
      name: p.name,
      phone: p.phone,
      email: p.email,
      status: p.status,
      vipLevel: p.vipLevel,
      groupName: p.group?.name,
      consultantName: p.consultant?.name,
      isBlacklisted: p.isBlacklisted,
      // Live Smartico data (null if not matched)
      liveDeposit: s?.deposits ?? null,
      liveWithdrawal: s?.withdrawals ?? null,
      liveNet: s ? s.deposits - s.withdrawals : null,
      hasLiveActivity: s ? s.eventCount > 0 : false,
      createdAt: p.createdAt,
    }
  })

  return NextResponse.json({ data: enriched, source: byPlayer.size > 0 ? 'smartico' : 'database' })
}
