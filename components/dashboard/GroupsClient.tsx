'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, Search, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { mockGroups, mockPlayers } from '@/lib/mock-data'

export default function GroupsClient() {
  const t = useTranslations('groups')
  const tc = useTranslations('common')
  const [search,setSearch]=useState('')
  const [expanded,setExpanded]=useState<string|null>(null)
  const filtered=mockGroups.filter(g=>g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>{mockGroups.length} groups</p>
        </div>
        <button className="tsm-btn-primary"><Plus size={15}/> {t('addGroup')}</button>
      </div>
      <div className="relative w-60">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9ca3af'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`${tc('search')}...`} className="tsm-input pl-9 py-2 text-[13px]"/>
      </div>
      <div className="space-y-3">
        {filtered.map(group=>{
          const players=mockPlayers.filter(p=>p.groupName===group.name)
          const isExp=expanded===group.id
          const net=group.totalDeposits-group.totalWithdrawals
          return (
            <div key={group.id} className="tsm-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={()=>setExpanded(isExp?null:group.id)}>
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-sky-500/20"><Users size={16} className="text-sky-400"/></div>
                  <div>
                    <h3 className="font-semibold text-white text-[14px]">{group.name}</h3>
                    <p className="text-[11px]" style={{color:'#9ca3af'}}>{group.consultant} · {group.playerCount} players</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] mb-0.5" style={{color:'#9ca3af'}}>Dep</p>
                    <p className="text-[13px] font-bold val-pos">{formatCurrency(group.totalDeposits)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] mb-0.5" style={{color:'#9ca3af'}}>Saq</p>
                    <p className="text-[13px] font-bold val-neg">{formatCurrency(group.totalWithdrawals)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] mb-0.5" style={{color:'#9ca3af'}}>Net</p>
                    <p className={`text-[13px] font-bold ${net>=0?'val-pos':'val-neg'}`}>{formatCurrency(net)}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={e=>{e.stopPropagation()}} className="p-1 rounded hover:bg-gray-50" style={{color:'#9ca3af'}}><Pencil size={13}/></button>
                    <button onClick={e=>{e.stopPropagation()}} className="p-1 rounded hover:bg-gray-50" style={{color:'#9ca3af'}}><Trash2 size={13}/></button>
                    {isExp?<ChevronUp size={15} style={{color:'#9ca3af'}}/>:<ChevronDown size={15} style={{color:'#9ca3af'}}/>}
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{borderTop:'1px solid #e5e7eb'}}>
                  <table className="tsm-table">
                    <thead><tr><th>Player</th><th>Phone</th><th>Status</th><th>Deposit</th><th>Withdrawal</th></tr></thead>
                    <tbody>
                      {players.length===0
                        ?<tr><td colSpan={5}><div className="tsm-empty text-sm">No players</div></td></tr>
                        :players.map(p=>(
                          <tr key={p.id}>
                            <td className="font-medium text-white text-[13px]">{p.name}</td>
                            <td className="text-[12px]">{p.phone||'—'}</td>
                            <td><span className="tsm-badge badge-green text-[10px] capitalize">{p.status}</span></td>
                            <td className="val-pos text-[12px] font-semibold">{p.deposit>0?formatCurrency(p.deposit):'—'}</td>
                            <td className="val-neg text-[12px] font-semibold">{p.withdrawal>0?formatCurrency(p.withdrawal):'—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
