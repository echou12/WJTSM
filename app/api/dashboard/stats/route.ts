// app/api/dashboard/stats/route.ts
// Dashboard stats: tries Smartico live first, falls back to local DB
// API REPLACEABLE: Remove Smartico calls and use only DB if needed

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  fetchTodayFinancialEvents,
  fetchWeeklyEvents,
  aggregateByPlayer,
  buildWeeklyChartData,
  computeTotals,
} from '@/lib/smartico'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Try Smartico live data ────────────────────────────────────────────────
  let useLive = false
  let todayEvents: any[] = []
  let weeklyEvents: any[] = []

  try {
    ;[todayEvents, weeklyEvents] = await Promise.all([
      fetchTodayFinancialEvents(),
      fetchWeeklyEvents(7),
    ])
    useLive = todayEvents.length > 0 || weeklyEvents.length > 0
  } catch (err) {
    console.warn('[Dashboard] Smartico unavailable, falling back to DB:', err)
  }

  let todayStats: any
  let vipData: any
  let groupSummaries: any[]
  let weekly: any[]

  if (useLive) {
    // ── LIVE from Smartico ────────────────────────────────────────────────
    const totals = computeTotals(todayEvents)
    const byPlayer = aggregateByPlayer(todayEvents)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const newPlayers = await prisma.player.count({ where: { createdAt: { gte: todayStart } } })

    todayStats = { ...totals, newPlayers }

    const vipPlayers = await prisma.player.findMany({
      where: { status: 'vip' },
      select: { id: true, name: true, phone: true, status: true, smarticoId: true },
    })

    const vipMapped = vipPlayers.map(p => {
      const s = p.smarticoId ? byPlayer.get(p.smarticoId) : null
      return {
        id: p.id, name: p.name, phone: p.phone, status: p.status,
        deposit: s?.deposits ?? 0,
        withdrawal: s?.withdrawals ?? 0,
        houseProfit: (s?.deposits ?? 0) * 0.05,
        hasActivity: (s?.eventCount ?? 0) > 0,
      }
    })

    vipData = {
      deposits: vipMapped.reduce((s, p) => s + p.deposit, 0),
      withdrawals: vipMapped.reduce((s, p) => s + p.withdrawal, 0),
      net: vipMapped.reduce((s, p) => s + p.deposit - p.withdrawal, 0),
      players: vipMapped,
    }

    const groups = await prisma.group.findMany({
      include: {
        consultant: { select: { name: true } },
        players: { select: { id: true, name: true, phone: true, status: true, smarticoId: true } },
      },
    })

    groupSummaries = groups.map(g => {
      const players = g.players.map(p => {
        const s = p.smarticoId ? byPlayer.get(p.smarticoId) : null
        return {
          id: p.id, name: p.name, phone: p.phone, status: p.status,
          deposit: s?.deposits ?? 0,
          withdrawal: s?.withdrawals ?? 0,
          houseProfit: (s?.deposits ?? 0) * 0.05,
          hasActivity: (s?.eventCount ?? 0) > 0,
        }
      })
      return {
        groupName: g.name, consultant: g.consultant?.name,
        deposits: players.reduce((s, p) => s + p.deposit, 0),
        withdrawals: players.reduce((s, p) => s + p.withdrawal, 0),
        net: players.reduce((s, p) => s + p.deposit - p.withdrawal, 0),
        players,
      }
    })

    weekly = buildWeeklyChartData(weeklyEvents)

  } else {
    // ── FALLBACK: local DB ────────────────────────────────────────────────
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const dbTransfers = await prisma.transfer.findMany({
      where: { transferAt: { gte: todayStart, lt: todayEnd } },
    })

    const totalDeposits = dbTransfers.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)
    const totalWithdrawals = dbTransfers.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0)
    const houseProfit = dbTransfers.reduce((s, t) => s + (t.houseProfit || 0), 0)
    const activePlayers = new Set(dbTransfers.map(t => t.playerId)).size
    const newPlayers = await prisma.player.count({ where: { createdAt: { gte: todayStart } } })

    todayStats = { totalDeposits, totalWithdrawals, netBalance: totalDeposits - totalWithdrawals, houseProfit, activePlayers, newPlayers }

    const vipPlayers = await prisma.player.findMany({
      where: { status: 'vip' },
      include: { transfers: { where: { transferAt: { gte: todayStart, lt: todayEnd } } } },
    })

    const vipMapped = vipPlayers.map(p => ({
      id: p.id, name: p.name, phone: p.phone, status: p.status,
      deposit: p.transfers.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
      withdrawal: p.transfers.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
      houseProfit: p.transfers.reduce((s, t) => s + (t.houseProfit || 0), 0),
      hasActivity: p.transfers.length > 0,
    }))

    vipData = {
      deposits: vipMapped.reduce((s, p) => s + p.deposit, 0),
      withdrawals: vipMapped.reduce((s, p) => s + p.withdrawal, 0),
      net: vipMapped.reduce((s, p) => s + p.deposit - p.withdrawal, 0),
      players: vipMapped,
    }

    const groups = await prisma.group.findMany({
      include: {
        consultant: { select: { name: true } },
        players: { include: { transfers: { where: { transferAt: { gte: todayStart, lt: todayEnd } } } } },
      },
    })

    groupSummaries = groups.map(g => {
      const players = g.players.map(p => ({
        id: p.id, name: p.name, phone: p.phone, status: p.status,
        deposit: p.transfers.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
        withdrawal: p.transfers.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
        houseProfit: p.transfers.reduce((s, t) => s + (t.houseProfit || 0), 0),
        hasActivity: p.transfers.length > 0,
      }))
      return {
        groupName: g.name, consultant: g.consultant?.name,
        deposits: players.reduce((s, p) => s + p.deposit, 0),
        withdrawals: players.reduce((s, p) => s + p.withdrawal, 0),
        net: players.reduce((s, p) => s + p.deposit - p.withdrawal, 0),
        players,
      }
    })

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    weekly = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      const ts = await prisma.transfer.findMany({ where: { transferAt: { gte: d, lt: next } } })
      weekly.push({
        day: days[d.getDay()],
        deposits: ts.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
        withdrawals: ts.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
      })
    }
  }

  return NextResponse.json({
    data: { today: todayStats, vip: vipData, groups: groupSummaries, weekly },
    source: useLive ? 'smartico' : 'database',
  })
}
