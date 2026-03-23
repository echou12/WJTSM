'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Crown, Plus, Eye, Pencil, Search, BarChart2 } from 'lucide-react'
import { formatCurrency, getRoleColor } from '@/lib/utils'
import { mockUsers, mockPlayers } from '@/lib/mock-data'

export default function ConsultantsClient() {
  const t = useTranslations('consultants')
  const tc = useTranslations('common')
  const [search,setSearch]=useState('')

  const consultants = mockUsers.filter(u=>['consultant','manager'].includes(u.role))
  const enriched = consultants.map(c=>{
    const mp=mockPlayers.filter(p=>p.consultant===c.name)
    const dep=mp.reduce((s,p)=>s+(p.deposit||0),0)
    const wit=mp.reduce((s,p)=>s+(p.withdrawal||0),0)
    return {...c,playerCount:mp.length,totalDeposits:dep,totalWithdrawals:wit,vipCount:mp.filter(p=>p.status==='vip').length,net:dep-wit}
  })
  const filtered=enriched.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>{consultants.length} active</p>
        </div>
        <button className="tsm-btn-primary"><Plus size={15}/> {t('addConsultant')}</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {label:'Total Consultants', val:consultants.length, color:'text-white'},
          {label:t('totalPlayers'),   val:enriched.reduce((s,c)=>s+c.playerCount,0), color:'text-white'},
          {label:'Volume Total',      val:formatCurrency(enriched.reduce((s,c)=>s+c.totalDeposits,0)), color:'val-pos'},
        ].map((s,i)=>(
          <div key={i} className="tsm-card p-5">
            <p className="tsm-section-title">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="tsm-card overflow-hidden">
        <div className="px-5 py-3.5" style={{borderBottom:'1px solid #e5e7eb'}}>
          <div className="relative w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9ca3af'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`${tc('search')}...`} className="tsm-input pl-9 py-2 text-[13px]"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="tsm-table">
            <thead><tr>
              <th>Consultant</th><th>Role</th><th>Players</th><th>VIPs</th>
              <th>Deposits</th><th>Withdrawals</th><th>Net</th><th className="text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                           style={{background:'#eff2ff',color:'#4f6ef7'}}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-[13px]">{c.name}</p>
                        <p className="text-[11px]" style={{color:'#9ca3af'}}>{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`tsm-badge ${getRoleColor(c.role)}`}>{c.role}</span></td>
                  <td><span className="flex items-center gap-1 text-[13px]"><Users size={13} style={{color:'#9ca3af'}}/>{c.playerCount}</span></td>
                  <td><span className="flex items-center gap-1 text-[13px] font-semibold" style={{color:'var(--yellow)'}}><Crown size={13}/>{c.vipCount}</span></td>
                  <td className="val-pos font-semibold text-[13px]">{formatCurrency(c.totalDeposits)}</td>
                  <td className="val-neg font-semibold text-[13px]">{formatCurrency(c.totalWithdrawals)}</td>
                  <td className={`font-bold text-[13px] ${c.net>=0?'val-pos':'val-neg'}`}>{formatCurrency(c.net)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{color:'#9ca3af'}}><Eye size={14}/></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{color:'#9ca3af'}}><Pencil size={14}/></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{color:'#9ca3af'}}><BarChart2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
