// components/dashboard/SmarticoPanel.tsx
'use client'

import { useState, useCallback } from 'react'
import { RefreshCw, Wifi, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Clock, Loader2, Database } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface SmarticoEvent {
  event_id: string
  ext_player_id: string
  player_name?: string
  event_type: string
  amount?: number
  currency?: string
  created_at: string
}

interface SyncResult {
  message: string
  eventsProcessed: number
  transfersSynced: number
  playersCreated: number
  period: string
}

export default function SmarticoPanel() {
  const [events, setEvents] = useState<SmarticoEvent[]>([])
  const [loading, setLoading]   = useState(false)
  const [syncing, setSyncing]   = useState(false)
  const [error, setError]       = useState('')
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [period, setPeriod]     = useState<'today' | 'weekly'>('today')

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const from = new Date()
      if (period === 'weekly') from.setDate(from.getDate() - 7)
      else from.setHours(0, 0, 0, 0)
      const res = await fetch(`/api/smartico/events?from=${from.toISOString()}&to=${new Date().toISOString()}&types=deposit,withdrawal`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      setEvents(json.data || [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [period])

  const handleSync = async () => {
    setSyncing(true); setSyncResult(null); setError('')
    try {
      const res = await fetch(`/api/smartico/sync?period=${period}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Sync failed')
      setSyncResult(json)
    } catch (e: any) { setError(e.message) }
    finally { setSyncing(false) }
  }

  const totalDeposits    = events.filter(e => e.event_type === 'deposit').reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalWithdrawals = events.filter(e => e.event_type === 'withdrawal').reduce((s, e) => s + (e.amount ?? 0), 0)
  const uniquePlayers    = new Set(events.map(e => e.ext_player_id)).size

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="icon-box bg-sky-500/20"><Wifi size={17} className="text-sky-400" /></div>
            Smartico
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#9ca3af' }}>
            Brand: <span className="font-mono" style={{ color: '#4f6ef7' }}>wjcasino</span>
            {' · '}
            <span className="font-mono text-[11px]">apis6.smartico.ai</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="tsm-card p-4 flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          {(['today', 'weekly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
                    className="px-4 py-2 text-[12px] font-medium transition-colors"
                    style={{
                      background: period === p ? 'var(--accent)' : 'var(--bg-surface)',
                      color: period === p ? 'white' : 'var(--text-secondary)',
                    }}>
              {p === 'today' ? 'Today' : 'Last 7 days'}
            </button>
          ))}
        </div>

        <button onClick={fetchEvents} disabled={loading} className="tsm-btn-ghost text-[12px]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Fetching...' : 'Fetch Events'}
        </button>

        <button onClick={handleSync} disabled={syncing} className="tsm-btn-primary text-[12px]">
          {syncing ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
          {syncing ? 'Syncing...' : 'Sync to DB'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="tsm-card p-4 flex items-start gap-3" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
          <AlertCircle size={17} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="font-semibold text-[13px]" style={{ color: '#dc2626' }}>Connection Error</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>{error}</p>
            <p className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>Dashboard will use local DB data automatically.</p>
          </div>
        </div>
      )}

      {/* Sync result */}
      {syncResult && (
        <div className="tsm-card p-4" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <p className="font-semibold text-[13px] flex items-center gap-2 mb-3" style={{ color: '#16a34a' }}>
            <CheckCircle size={15} /> Sync Complete
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Events processed', syncResult.eventsProcessed],
              ['Transfers saved',  syncResult.transfersSynced],
              ['Players created',  syncResult.playersCreated],
              ['Period',           syncResult.period === 'weekly' ? '7 days' : 'Today'],
            ].map(([label, val]) => (
              <div key={label as string} className="rounded-xl p-3" style={{ background: '#f9fafb' }}>
                <p className="tsm-section-title">{label}</p>
                <p className="text-lg font-bold text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Deposits',    val: formatCurrency(totalDeposits),    cls: 'val-pos', icon: TrendingUp,   bg: 'bg-emerald-500/20', count: events.filter(e => e.event_type === 'deposit').length },
            { label: 'Total Withdrawals', val: formatCurrency(totalWithdrawals), cls: 'val-neg', icon: TrendingDown,  bg: 'bg-rose-500/20',    count: events.filter(e => e.event_type === 'withdrawal').length },
            { label: 'Unique Players',    val: String(uniquePlayers),           cls: 'text-white', icon: Wifi,       bg: 'bg-sky-500/20',     count: events.length },
          ].map(s => (
            <div key={s.label} className="tsm-card p-5 flex items-center gap-4">
              <div className={`icon-box ${s.bg}`}><s.icon size={17} className="text-white" /></div>
              <div>
                <p className="tsm-section-title">{s.label}</p>
                <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{s.count} events</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events table */}
      {events.length > 0 && (
        <div className="tsm-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-white text-[14px]">
              Events <span className="text-gray-400 font-normal text-[13px]">({events.length})</span>
            </h3>
            <span className="text-[11px] flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
              <Clock size={12} /> Just now
            </span>
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: '480px', overflowY: 'auto' }}>
            <table className="tsm-table">
              <thead className="sticky top-0" style={{ background: '#fff', zIndex: 10 }}>
                <tr>
                  <th>Event ID</th><th>Player ID</th><th>Name</th>
                  <th>Type</th><th>Amount</th><th>Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={`${e.event_id}-${i}`}>
                    <td className="font-mono text-[11px]" style={{ color: '#9ca3af' }}>
                      {e.event_id.slice(0, 14)}…
                    </td>
                    <td className="font-mono text-[11px]">{e.ext_player_id}</td>
                    <td className="text-white text-[13px]">{e.player_name || '—'}</td>
                    <td>
                      <span className={`tsm-badge text-[11px] ${e.event_type === 'deposit' ? 'badge-green' : 'badge-red'}`}>
                        {e.event_type === 'deposit' ? '↑ Deposit' : '↓ Withdrawal'}
                      </span>
                    </td>
                    <td className={`font-bold text-[13px] ${e.event_type === 'deposit' ? 'val-pos' : 'val-neg'}`}>
                      {e.amount != null ? formatCurrency(e.amount, e.currency || 'BRL') : '—'}
                    </td>
                    <td className="text-[12px]">{e.created_at ? formatDateTime(e.created_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && !error && (
        <div className="tsm-card">
          <div className="tsm-empty" style={{ padding: '64px 24px' }}>
            <Wifi size={36} style={{ color: '#9ca3af', marginBottom: 8 }} />
            <p className="font-medium text-white">No events loaded</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Click "Fetch Events" to query Smartico</p>
          </div>
        </div>
      )}
    </div>
  )
}
