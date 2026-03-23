// app/api/smartico/events/route.ts
// Proxies Smartico API through Next.js — keeps API keys server-side
// FUTURE EXTENSION: Add caching layer (Redis/Vercel KV) here

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchEvents, fetchTodayFinancialEvents } from '@/lib/smartico'

// GET /api/smartico/events?from=ISO&to=ISO&types=deposit,withdrawal
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')
  const typesStr = searchParams.get('types')

  const from = fromStr ? new Date(fromStr) : (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
  const to = toStr ? new Date(toStr) : new Date()
  const event_types = typesStr ? typesStr.split(',') : ['deposit', 'withdrawal']

  try {
    const result = await fetchEvents({ from, to, event_types })
    return NextResponse.json({ data: result.events, total: result.total })
  } catch (err: any) {
    console.error('[API] Smartico events error:', err)
    return NextResponse.json({ error: err.message || 'Smartico API error' }, { status: 502 })
  }
}
