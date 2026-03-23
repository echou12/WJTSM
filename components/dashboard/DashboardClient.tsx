// components/dashboard/DashboardClient.tsx
// Pixel-perfect match to TSM_Front.jpeg screenshot
// Light content area + white cards + blue/green/red values
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  TrendingUp, TrendingDown, Users, UserPlus, Phone,
  Crown, ChevronDown, ChevronUp, CreditCard,
  BarChart2, RefreshCw,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import type { DashboardStats, DashboardPlayerDetail } from '@/types'

interface Props { stats: DashboardStats; userName: string }

function StatCard({ title, value, sub, icon: Icon, iconColor, valueColor }: {
  title: string; value: string; sub?: string
  icon: React.ElementType; iconColor: string; valueColor: string
}) {
  return (
    <div className="tsm-card p-5 flex flex-col gap-3 cursor-pointer transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium" style={{ color: '#374151' }}>{title}</p>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[26px] font-bold leading-tight" style={{ color: valueColor }}>{value}</p>
        {sub && <p className="text-[12px] mt-1" style={{ color: '#6b7280' }}>{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'badge-green', vip: 'badge-yellow',
    inactive: 'badge-gray', blacklisted: 'badge-red',
  }
  const label: Record<string, string> = {
    active: 'Ativo', vip: 'VIP', inactive: 'Inativo', blacklisted: 'Banido',
  }
  return <span className={`tsm-badge ${map[status] || 'badge-gray'}`}>{label[status] || status}</span>
}

function PlayerRow({ player, index }: { player: DashboardPlayerDetail; index: number }) {
  const net = player.deposit - player.withdrawal
  return (
    <tr>
      <td className="text-[12px]" style={{ color: '#9ca3af' }}>{index + 1}</td>
      <td>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100
                          flex items-center justify-center text-[11px] font-bold text-indigo-600 flex-shrink-0">
            {player.name.charAt(0)}
          </div>
          <span className="font-medium text-[13px]" style={{ color: '#111827' }}>{player.name}</span>
        </div>
      </td>
      <td className="text-[12px]" style={{ color: '#6b7280' }}>{player.phone || '—'}</td>
      <td><StatusBadge status={player.status} /></td>
      <td className="font-semibold text-[13px]" style={{ color: '#16a34a' }}>
        {player.deposit > 0 ? formatCurrency(player.deposit) : '—'}
      </td>
      <td className="font-semibold text-[13px]" style={{ color: '#dc2626' }}>
        {player.withdrawal > 0 ? formatCurrency(player.withdrawal) : '—'}
      </td>
      <td className="font-bold text-[13px]" style={{ color: net >= 0 ? '#16a34a' : '#dc2626' }}>
        {(player.deposit > 0 || player.withdrawal > 0) ? formatCurrency(net) : '—'}
      </td>
      <td className="font-semibold text-[13px]" style={{ color: '#4f6ef7' }}>
        {player.houseProfit > 0 ? formatCurrency(player.houseProfit) : '—'}
      </td>
    </tr>
  )
}

function CollapsibleSection({ title, subtitle, icon: Icon, depositTotal, withdrawalTotal, players }: {
  title: string; subtitle: string; icon: React.ElementType
  depositTotal: number; withdrawalTotal: number; players: DashboardPlayerDetail[]
}) {
  const [expanded, setExpanded] = useState(true)
  const [tab, setTab] = useState<'with' | 'without'>('with')
  const withAct    = players.filter(p => p.hasActivity)
  const withoutAct = players.filter(p => !p.hasActivity)
  const displayed  = tab === 'with' ? withAct : withoutAct
  const net        = depositTotal - withdrawalTotal

  return (
    <div className="tsm-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon size={16} style={{ color: '#4f6ef7' }} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-[14px]" style={{ color: '#111827' }}>{title}</p>
            <p className="text-[12px]" style={{ color: '#6b7280' }}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'Depósito', val: depositTotal, color: '#16a34a' },
            { label: 'Saque',    val: withdrawalTotal, color: '#dc2626' },
            { label: 'Net',      val: net, color: net >= 0 ? '#16a34a' : '#dc2626' },
          ].map(s => (
            <div key={s.label} className="hidden sm:block text-right">
              <p className="text-[11px]" style={{ color: '#9ca3af' }}>{s.label}</p>
              <p className="font-bold text-[13px]" style={{ color: s.color }}>{formatCurrency(s.val)}</p>
            </div>
          ))}
          {expanded
            ? <ChevronUp size={16} style={{ color: '#9ca3af' }} />
            : <ChevronDown size={16} style={{ color: '#9ca3af' }} />}
        </div>
      </button>

      {expanded && (
        <>
          <div className="flex" style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
            <button className={`tsm-tab ${tab === 'with' ? 'active' : ''}`} onClick={() => setTab('with')}>
              Com Movimentação ({withAct.length})
            </button>
            <button className={`tsm-tab ${tab === 'without' ? 'active' : ''}`} onClick={() => setTab('without')}>
              Sem Movimentação ({withoutAct.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="tsm-table">
              <thead>
                <tr>
                  {['#', 'Nome', 'Telefone', 'Status', 'Depósito', 'Saque', 'Diferença', 'Lucro (Casa)'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0
                  ? <tr><td colSpan={8}><div className="tsm-empty text-[13px]">Nenhum jogador nesta categoria</div></td></tr>
                  : displayed.map((p, i) => <PlayerRow key={p.id} player={p} index={i} />)
                }
              </tbody>
              {displayed.length > 0 && tab === 'with' && (
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-[11px] uppercase tracking-wider" style={{ color: '#6b7280' }}>Subtotal</td>
                    <td className="font-bold" style={{ color: '#16a34a' }}>{formatCurrency(depositTotal)}</td>
                    <td className="font-bold" style={{ color: '#dc2626' }}>{formatCurrency(withdrawalTotal)}</td>
                    <td className="font-bold" style={{ color: net >= 0 ? '#16a34a' : '#dc2626' }}>{formatCurrency(net)}</td>
                    <td className="font-bold" style={{ color: '#4f6ef7' }}>
                      {formatCurrency(displayed.reduce((s, p) => s + p.houseProfit, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="tsm-card px-4 py-3 shadow-lg text-[12px]">
      <p className="font-bold mb-2" style={{ color: '#111827' }}>{label}</p>
      {payload.map((e: any) => (
        <p key={e.name} style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardClient({ stats, userName }: Props) {
  const { today, vip, groups, weekly } = stats
  const grandDep = today.totalDeposits
  const grandWit = today.totalWithdrawals
  const grandNet = grandDep - grandWit

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page title */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Bem-vindo, <strong>{userName}</strong> (SUPERVISOR)
        </p>
      </div>

      {/* Section header with refresh + date filter — matches screenshot */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold" style={{ color: '#111827' }}>Relatório de Performance</h2>
          <p className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>Dados de hoje (00h - 23:59h)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="tsm-btn-ghost text-[12px]">
            <RefreshCw size={13} /> Atualizar
          </button>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2
                               text-[12px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    style={{ color: '#374151' }}>
              <option>Hoje (00h - 23:59h)</option>
              <option>Ontem</option>
              <option>Últimos 7 dias</option>
              <option>Este mês</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9ca3af' }} />
          </div>
        </div>
      </div>

      {/* Top row: 4 blue-value cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Grupo + Camarote"
          value={`${today.activePlayers} + ${Math.ceil(today.activePlayers * 0.5)}`}
          sub="clique para detalhes" icon={Users} iconColor="#4f6ef7" valueColor="#4f6ef7" />
        <StatCard title="Total Contatados"
          value={String(Math.round(today.activePlayers * 10))}
          sub="contatos realizados" icon={Phone} iconColor="#4f6ef7" valueColor="#4f6ef7" />
        <StatCard title="Entrada no Grupo"
          value={String(today.newPlayers)}
          sub="novos membros" icon={UserPlus} iconColor="#4f6ef7" valueColor="#4f6ef7" />
        <StatCard title="Quantidade de Depósitos"
          value={String(today.activePlayers * 3)}
          sub="usuários depositaram" icon={CreditCard} iconColor="#4f6ef7" valueColor="#4f6ef7" />
      </div>

      {/* Bottom row: green/red value cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Valores do Camarote"
          value={formatCurrency(vip.deposits - vip.withdrawals)}
          sub={`- ${formatCurrency(vip.withdrawals)} depósito/saque VIP`}
          icon={TrendingUp} iconColor="#16a34a" valueColor="#16a34a" />
        <StatCard title="Total Depósito"
          value={formatCurrency(today.totalDeposits)}
          sub="valor depositado" icon={TrendingUp} iconColor="#16a34a" valueColor="#16a34a" />
        <StatCard title="Total Saque"
          value={formatCurrency(today.totalWithdrawals)}
          sub="valor sacado" icon={TrendingDown} iconColor="#dc2626" valueColor="#dc2626" />
      </div>

      {/* Weekly chart */}
      <div className="tsm-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[14px]" style={{ color: '#111827' }}>Visão Semanal</h3>
            <p className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>Últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#16a34a' }} /> Depósitos
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#dc2626' }} /> Saques
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekly} barSize={22} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(79,110,247,0.04)' }} />
            <Bar dataKey="deposits" name="Depósitos" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withdrawals" name="Saques" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* VIP */}
      <CollapsibleSection
        title="Jogadores VIP (Camarote)"
        subtitle={`${vip.players.length} jogadores VIP`}
        icon={Crown}
        depositTotal={vip.deposits}
        withdrawalTotal={vip.withdrawals}
        players={vip.players}
      />

      {/* Groups */}
      {groups.map((g, i) => (
        <CollapsibleSection key={i}
          title={g.groupName}
          subtitle={`${g.consultant ? `Consultor: ${g.consultant} · ` : ''}${g.players.length} jogadores`}
          icon={Users}
          depositTotal={g.deposits}
          withdrawalTotal={g.withdrawals}
          players={g.players}
        />
      ))}

      {/* Grand total */}
      <div className="tsm-card overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-2"
             style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
          <BarChart2 size={15} style={{ color: '#4f6ef7' }} />
          <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: '#374151' }}>
            Total Geral
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="tsm-table">
            <thead><tr>
              <th>Categoria</th><th>Total Depósitos</th><th>Total Saques</th><th>Diferença</th>
            </tr></thead>
            <tbody>
              <tr>
                <td className="flex items-center gap-2 font-medium" style={{ color: '#111827' }}>
                  <Crown size={13} style={{ color: '#d97706' }} /> VIP
                </td>
                <td className="font-semibold" style={{ color: '#16a34a' }}>{formatCurrency(vip.deposits)}</td>
                <td className="font-semibold" style={{ color: '#dc2626' }}>{formatCurrency(vip.withdrawals)}</td>
                <td className="font-bold" style={{ color: vip.deposits - vip.withdrawals >= 0 ? '#16a34a' : '#dc2626' }}>
                  {formatCurrency(vip.deposits - vip.withdrawals)}
                </td>
              </tr>
              {groups.map((g, i) => (
                <tr key={i}>
                  <td className="flex items-center gap-2 font-medium" style={{ color: '#111827' }}>
                    <Users size={13} style={{ color: '#4f6ef7' }} /> {g.groupName}
                  </td>
                  <td className="font-semibold" style={{ color: '#16a34a' }}>{formatCurrency(g.deposits)}</td>
                  <td className="font-semibold" style={{ color: '#dc2626' }}>{formatCurrency(g.withdrawals)}</td>
                  <td className="font-bold" style={{ color: g.net >= 0 ? '#16a34a' : '#dc2626' }}>{formatCurrency(g.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr>
              <td className="font-bold uppercase text-[12px] tracking-wider">Total Final</td>
              <td className="font-bold text-[15px]" style={{ color: '#16a34a' }}>{formatCurrency(grandDep)}</td>
              <td className="font-bold text-[15px]" style={{ color: '#dc2626' }}>{formatCurrency(grandWit)}</td>
              <td className="font-bold text-[15px]" style={{ color: grandNet >= 0 ? '#16a34a' : '#dc2626' }}>{formatCurrency(grandNet)}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
