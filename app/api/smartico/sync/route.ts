// app/api/smartico/sync/route.ts
// Pulls Smartico events and upserts them into local Prisma DB
// Call this endpoint on a cron or manually from the dashboard
// FUTURE EXTENSION: Set up Vercel Cron Job to call POST /api/smartico/sync every hour

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { fetchTodayFinancialEvents, fetchWeeklyEvents, aggregateByPlayer } from '@/lib/smartico'

// POST /api/smartico/sync?period=today|weekly
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['superadmin', 'admin', 'manager'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'today'

  try {
    const events = period === 'weekly'
      ? await fetchWeeklyEvents(7)
      : await fetchTodayFinancialEvents()

    if (!events.length) {
      return NextResponse.json({ message: 'No events returned from Smartico', synced: 0 })
    }

    let synced = 0
    let playersCreated = 0

    for (const event of events) {
      // 1. Upsert player by smarticoId
      let player = await prisma.player.findUnique({
        where: { smarticoId: event.ext_player_id },
      })

      if (!player) {
        player = await prisma.player.create({
          data: {
            smarticoId: event.ext_player_id,
            name: event.player_name || `Player #${event.ext_player_id}`,
            status: 'active',
          },
        })
        playersCreated++
      }

      // 2. Only sync deposit/withdrawal events as transfers
      if (event.event_type !== 'deposit' && event.event_type !== 'withdrawal') continue

      // 3. Check if transfer already exists (idempotent by event_id stored in note)
      const existingTransfer = await prisma.transfer.findFirst({
        where: {
          playerId: player.id,
          note: { contains: event.event_id },
        },
      })

      if (!existingTransfer) {
        await prisma.transfer.create({
          data: {
            playerId: player.id,
            type: event.event_type as 'deposit' | 'withdrawal',
            amount: event.amount ?? 0,
            currency: event.currency || 'BRL',
            houseProfit: event.event_type === 'deposit' ? (event.amount ?? 0) * 0.05 : 0,
            note: `smartico:${event.event_id}`,
            transferAt: new Date(event.created_at),
          },
        })
        synced++
      }
    }

    return NextResponse.json({
      message: 'Sync complete',
      eventsProcessed: events.length,
      transfersSynced: synced,
      playersCreated,
      period,
    })
  } catch (err: any) {
    console.error('[Sync] Smartico sync error:', err)
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 502 })
  }
}
