'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Wifi, Database, AlertCircle, CheckCircle } from 'lucide-react'
import DashboardClient from './DashboardClient'
import type { DashboardStats } from '@/types'

interface Props {
  stats: DashboardStats; userName: string
  userRole: string; dataSource: 'smartico' | 'database' | 'mock'
}

const SRC = {
  smartico: { label: 'Live · Smartico', cls: 'badge-green' },
  database: { label: 'Local · DB',      cls: 'badge-blue'  },
  mock:     { label: 'Demo · Mock',     cls: 'badge-yellow'},
}

export default function DashboardLive({ stats, userName, userRole, dataSource }: Props) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const src = SRC[dataSource] || SRC.database

  async function handleSync() {
    setSyncing(true); setSyncMsg('')
    try {
      const res = await fetch('/api/smartico/sync', { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        setSyncMsg(`✓ ${json.transfersSynced} transfers synced`)
        startTransition(() => router.refresh())
      } else setSyncMsg(`✗ ${json.error || 'Sync failed'}`)
    } catch (e: any) { setSyncMsg(`✗ ${e.message}`) }
    finally { setSyncing(false); setTimeout(() => setSyncMsg(''), 6000) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`tsm-badge ${src.cls}`}>{src.label}</span>
          {syncMsg && (
            <span className="text-[12px] font-medium" style={{ color: syncMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
              {syncMsg}
            </span>
          )}
        </div>
        {['superadmin', 'admin', 'manager'].includes(userRole) && (
          <button onClick={handleSync} disabled={syncing || isPending}
                  className="tsm-btn-ghost text-[12px]">
            <RefreshCw size={13} className={syncing || isPending ? 'animate-spin' : ''} />
            Sync Smartico
          </button>
        )}
      </div>
      <DashboardClient stats={stats} userName={userName} />
    </div>
  )
}
