// lib/smartico.ts
// Smartico API client — fetches player events/transactions
// API REPLACEABLE: All Smartico calls go through this file
// Docs: https://drive-6.smartico.ai/24050#/api_IntegrationApiDoc

const SMARTICO_URL = process.env.SMARTICO_URL || 'https://apis6.smartico.ai/api/external/events/v2'
const SMARTICO_AUTH = process.env.SMARTICO_AUTH || '377e796f-aa37-4258-87cd-b238248ff2fa'
const EXT_BRAND_ID = process.env.SMARTICO_BRAND || 'wjcasino'

const HEADERS = {
  Authorization: SMARTICO_AUTH,
  'Content-Type': 'application/json',
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface SmarticoEvent {
  event_id: string
  ext_player_id: string
  player_name?: string
  event_type: string       // 'deposit' | 'withdrawal' | 'bet' | 'win' | 'login' etc.
  amount?: number
  currency?: string
  created_at: string
  extra?: Record<string, unknown>
}

export interface SmarticoPlayer {
  ext_player_id: string
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  vip_level?: number
  registration_date?: string
  last_login?: string
  total_deposits?: number
  total_withdrawals?: number
  balance?: number
  country?: string
  status?: string
}

export interface SmarticoEventsResponse {
  events: SmarticoEvent[]
  total: number
  page: number
  page_size: number
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function isoDate(d: Date) {
  return d.toISOString()
}

// ─── API CALLS ───────────────────────────────────────────────────────────────

/**
 * Fetch player events (deposits, withdrawals, etc.) for a date range.
 * FUTURE EXTENSION: Add pagination support via `page` param.
 */
export async function fetchEvents(params: {
  from: Date
  to: Date
  event_types?: string[]   // e.g. ['deposit','withdrawal']
  ext_player_id?: string
  page?: number
  page_size?: number
}): Promise<SmarticoEventsResponse> {
  const body: Record<string, unknown> = {
    ext_brand_id: EXT_BRAND_ID,
    from: isoDate(params.from),
    to: isoDate(params.to),
    page: params.page ?? 1,
    page_size: params.page_size ?? 500,
  }

  if (params.event_types?.length) body.event_types = params.event_types
  if (params.ext_player_id) body.ext_player_id = params.ext_player_id

  const res = await fetch(SMARTICO_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
    // Next.js: don't cache — always fresh
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Smartico API error ${res.status}: ${text}`)
  }

  const json = await res.json()

  // Normalize response — Smartico may return events directly or nested
  if (Array.isArray(json)) {
    return { events: json, total: json.length, page: 1, page_size: json.length }
  }
  if (json.events) return json
  if (json.data) return { events: json.data, total: json.total ?? json.data.length, page: 1, page_size: 500 }

  return { events: [], total: 0, page: 1, page_size: 500 }
}

/**
 * Fetch today's deposit + withdrawal events
 */
export async function fetchTodayFinancialEvents(): Promise<SmarticoEvent[]> {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date()

  try {
    const result = await fetchEvents({
      from,
      to,
      event_types: ['deposit', 'withdrawal'],
    })
    return result.events
  } catch (err) {
    console.error('[Smartico] fetchTodayFinancialEvents failed:', err)
    return []
  }
}

/**
 * Fetch events for a specific player
 */
export async function fetchPlayerEvents(extPlayerId: string, days = 30): Promise<SmarticoEvent[]> {
  const from = new Date()
  from.setDate(from.getDate() - days)
  const to = new Date()

  try {
    const result = await fetchEvents({ from, to, ext_player_id: extPlayerId })
    return result.events
  } catch (err) {
    console.error(`[Smartico] fetchPlayerEvents(${extPlayerId}) failed:`, err)
    return []
  }
}

/**
 * Fetch events for the past N days (for weekly chart)
 */
export async function fetchWeeklyEvents(days = 7): Promise<SmarticoEvent[]> {
  const from = new Date()
  from.setDate(from.getDate() - days)
  from.setHours(0, 0, 0, 0)
  const to = new Date()

  try {
    const result = await fetchEvents({
      from,
      to,
      event_types: ['deposit', 'withdrawal'],
    })
    return result.events
  } catch (err) {
    console.error('[Smartico] fetchWeeklyEvents failed:', err)
    return []
  }
}

// ─── DATA TRANSFORMERS ────────────────────────────────────────────────────────

/**
 * Group events by player_id and compute totals
 */
export function aggregateByPlayer(events: SmarticoEvent[]): Map<string, {
  ext_player_id: string
  deposits: number
  withdrawals: number
  net: number
  eventCount: number
}> {
  const map = new Map<string, ReturnType<typeof aggregateByPlayer> extends Map<string, infer V> ? V : never>()

  for (const e of events) {
    const pid = e.ext_player_id
    if (!map.has(pid)) {
      map.set(pid, { ext_player_id: pid, deposits: 0, withdrawals: 0, net: 0, eventCount: 0 })
    }
    const entry = map.get(pid)!
    const amt = e.amount ?? 0
    if (e.event_type === 'deposit') entry.deposits += amt
    else if (e.event_type === 'withdrawal') entry.withdrawals += amt
    entry.net = entry.deposits - entry.withdrawals
    entry.eventCount++
  }

  return map
}

/**
 * Build daily chart data from events (last 7 days)
 */
export function buildWeeklyChartData(events: SmarticoEvent[]): {
  day: string
  deposits: number
  withdrawals: number
}[] {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const result: Record<string, { day: string; deposits: number; withdrawals: number }> = {}

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    result[key] = { day: days[d.getDay()], deposits: 0, withdrawals: 0 }
  }

  for (const e of events) {
    const key = e.created_at.split('T')[0]
    if (result[key]) {
      const amt = e.amount ?? 0
      if (e.event_type === 'deposit') result[key].deposits += amt
      else if (e.event_type === 'withdrawal') result[key].withdrawals += amt
    }
  }

  return Object.values(result)
}

/**
 * Compute total stats from events array
 */
export function computeTotals(events: SmarticoEvent[]) {
  let totalDeposits = 0
  let totalWithdrawals = 0
  const playerSet = new Set<string>()

  for (const e of events) {
    playerSet.add(e.ext_player_id)
    const amt = e.amount ?? 0
    if (e.event_type === 'deposit') totalDeposits += amt
    else if (e.event_type === 'withdrawal') totalWithdrawals += amt
  }

  return {
    totalDeposits,
    totalWithdrawals,
    netBalance: totalDeposits - totalWithdrawals,
    houseProfit: totalDeposits * 0.05, // 5% estimated house edge
    activePlayers: playerSet.size,
  }
}
