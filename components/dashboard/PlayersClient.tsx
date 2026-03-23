// components/dashboard/PlayersClient.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Eye, Pencil, Trash2, X, Search, Ban, Settings2, Crown, CheckCircle } from 'lucide-react'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import { mockPlayers } from '@/lib/mock-data'

const ALL_COLS = [
  {key:'phone',label:'Phone',def:true},{key:'status',label:'Status',def:true},
  {key:'vipLevel',label:'VIP',def:true},{key:'group',label:'Group',def:true},
  {key:'consultant',label:'Consultant',def:true},{key:'deposit',label:'Deposit',def:true},
  {key:'withdrawal',label:'Withdrawal',def:true},
]

function StatusBadge({status}:{status:string}) {
  const map:any={active:'badge-green',vip:'badge-yellow',inactive:'badge-slate',blacklisted:'badge-red'}
  const label:any={active:'Active',vip:'VIP',inactive:'Inactive',blacklisted:'Banned'}
  return <span className={`tsm-badge ${map[status]||'badge-slate'}`}>{label[status]||status}</span>
}

function PlayerDetailModal({player,onClose,onBlacklist}:any) {
  const [tab,setTab]=useState<'in'|'out'>('in')
  return (
    <div className="tsm-overlay" onClick={onClose}>
      <div className="tsm-modal w-full max-w-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{borderBottom:'1px solid #e5e7eb'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                 style={{background:'#eff2ff',color:'#4f6ef7'}}>
              {player.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-white text-[15px]">{player.name}</h2>
              <StatusBadge status={player.status}/>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>onBlacklist(player)}
                    className={`tsm-badge cursor-pointer text-[11px] px-3 py-1.5 ${player.isBlacklisted?'badge-green':'badge-red'}`}>
              <Ban size={11}/> {player.isBlacklisted?'Remove Blacklist':'Blacklist'}
            </button>
            <button onClick={onClose} style={{color:'#9ca3af'}}><X size={18}/></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-6 py-4 flex-shrink-0" style={{borderBottom:'1px solid #e5e7eb'}}>
          {[['Phone',player.phone||'—'],['Group',player.groupName||'No group'],
            ['Deposits',formatCurrency(player.deposit||0)],['Withdrawals',formatCurrency(player.withdrawal||0)]
          ].map(([k,v])=>(
            <div key={k}><p className="text-[11px] mb-1" style={{color:'#9ca3af'}}>{k}</p>
            <p className="text-[13px] font-semibold text-white">{v}</p></div>
          ))}
        </div>
        <div className="flex flex-shrink-0" style={{borderBottom:'1px solid #e5e7eb'}}>
          {['In Group','Out of Group'].map((label,i)=>{
            const k=i===0?'in':'out'
            return <button key={k} onClick={()=>setTab(k as any)} className={`tsm-tab ${tab===k?'active':''}`}>{label}</button>
          })}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[11px] uppercase tracking-wider font-bold mb-3" style={{color:'#9ca3af'}}>
            {tab==='in'?'Transfer History':'Contact Logs'}
          </p>
          {tab==='in' ? (
            <div className="space-y-2">
              {[{type:'deposit',amt:player.deposit||0},{type:'withdrawal',amt:player.withdrawal||0}]
                .filter(t=>t.amt>0).map((tr,i)=>(
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                       style={{background:'#f9fafb'}}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                      ${tr.type==='deposit'?'badge-green':'badge-red'}`}>
                        {tr.type==='deposit'?'+':'-'}
                      </div>
                      <p className="font-medium text-white text-[13px] capitalize">{tr.type}</p>
                    </div>
                    <span className={`font-bold text-[13px] ${tr.type==='deposit'?'val-pos':'val-neg'}`}>
                      {tr.type==='deposit'?'+':'-'}{formatCurrency(tr.amt)}
                    </span>
                  </div>
                ))}
              {!player.deposit && !player.withdrawal && (
                <div className="tsm-empty">No transfers found</div>
              )}
            </div>
          ) : <div className="tsm-empty">No contact logs outside group</div>}
        </div>
      </div>
    </div>
  )
}

function BlacklistModal({player,onClose,onConfirm}:any) {
  const [note,setNote]=useState('')
  const isRemoving=player.isBlacklisted
  return (
    <div className="tsm-overlay" onClick={onClose}>
      <div className="tsm-modal w-full max-w-sm p-6 text-center" onClick={e=>e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
                        ${isRemoving?'badge-green':'badge-red'}`}>
          <Ban size={20}/>
        </div>
        <h3 className="font-semibold text-white mb-1">
          {isRemoving?'Remove Blacklist':'Add to Blacklist'}
        </h3>
        <p className="text-[13px] mb-4" style={{color:'#6b7280'}}>
          Player: <strong className="text-white">{player.name}</strong>
        </p>
        {!isRemoving && (
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                    placeholder="Reason (optional)..." className="tsm-input mb-4 resize-none" />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="tsm-btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={()=>onConfirm(note)}
                  className={`flex-1 justify-center font-semibold text-[13px] px-4 py-2 rounded-lg transition-all
                              ${isRemoving?'bg-emerald-500 hover:bg-emerald-600 text-white':'bg-rose-500 hover:bg-rose-600 text-white'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlayersClient() {
  const t  = useTranslations('players')
  const tc = useTranslations('common')
  const [players, setPlayers] = useState<any[]>(mockPlayers)
  const [search,setSearch]=useState('')
  const [statusFilter,setStatusFilter]=useState('')
  const [visibleCols,setVisibleCols]=useState(ALL_COLS.filter(c=>c.def).map(c=>c.key))
  const [colSettings,setColSettings]=useState(false)
  const [detailPlayer,setDetailPlayer]=useState<any>(null)
  const [blacklistPlayer,setBlacklistPlayer]=useState<any>(null)
  const [success,setSuccess]=useState('')

  const filtered=players.filter(p=>{
    const ms=!search||p.name.toLowerCase().includes(search.toLowerCase())||(p.phone&&p.phone.includes(search))
    const mst=!statusFilter||p.status===statusFilter
    return ms&&mst
  })

  function handleBlacklist(note:string) {
    if (!blacklistPlayer) return
    setPlayers(ps=>ps.map(p=>p.id===blacklistPlayer.id?{...p,isBlacklisted:!p.isBlacklisted,status:!p.isBlacklisted?'blacklisted':'inactive',blacklistNote:note}:p))
    setBlacklistPlayer(null)
    setSuccess(blacklistPlayer.isBlacklisted?'Removed from blacklist':'Added to blacklist')
    setTimeout(()=>setSuccess(''),3000)
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>{players.length} registered</p>
        </div>
        <button className="tsm-btn-primary"><Plus size={15}/> {t('addPlayer')}</button>
      </div>

      {success && (
        <div className="rounded-xl px-4 py-3 text-[13px] flex items-center gap-2"
             style={{background:'#f0fdf4',color:'#16a34a',border:'1px solid rgba(16,185,129,0.25)'}}>
          <CheckCircle size={15}/> {success}
        </div>
      )}

      <div className="tsm-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3" style={{borderBottom:'1px solid #e5e7eb'}}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9ca3af'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                     placeholder={`${tc('search')} players...`} className="tsm-input pl-9 py-2 text-[13px]"/>
            </div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                    className="tsm-input py-2 text-[13px] w-36">
              <option value="">All status</option>
              {['active','vip','inactive','blacklisted'].map(s=>(
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <button onClick={()=>setColSettings(!colSettings)} className="tsm-btn-ghost text-[12px]">
              <Settings2 size={13}/> Columns
            </button>
            {colSettings && (
              <>
                <div className="fixed inset-0 z-10" onClick={()=>setColSettings(false)}/>
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl z-20 p-3"
                     style={{background:'#fff',border:'1px solid #d1d5db'}}>
                  <p className="tsm-section-title px-1">Visible Columns</p>
                  {ALL_COLS.map(col=>(
                    <label key={col.key} className="flex items-center gap-2.5 py-1.5 cursor-pointer rounded px-1 hover:bg-gray-50">
                      <input type="checkbox" checked={visibleCols.includes(col.key)}
                             onChange={()=>setVisibleCols(p=>p.includes(col.key)?p.filter(k=>k!==col.key):[...p,col.key])}
                             className="w-3.5 h-3.5 accent-sky-500"/>
                      <span className="text-[12px]" style={{color:'#6b7280'}}>{col.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="tsm-table">
            <thead><tr>
              <th>#</th><th>Name</th>
              {visibleCols.includes('phone')&&<th>Phone</th>}
              {visibleCols.includes('status')&&<th>Status</th>}
              {visibleCols.includes('vipLevel')&&<th>VIP</th>}
              {visibleCols.includes('group')&&<th>Group</th>}
              {visibleCols.includes('consultant')&&<th>Consultant</th>}
              {visibleCols.includes('deposit')&&<th>Deposit</th>}
              {visibleCols.includes('withdrawal')&&<th>Withdrawal</th>}
              <th className="text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={10}><div className="tsm-empty">{tc('noData')}</div></td></tr>
              ) : filtered.map((player,i)=>(
                <tr key={player.id} style={player.isBlacklisted?{opacity:0.55}:{}}>
                  <td className="text-[11px]" style={{color:'#9ca3af'}}>{i+1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                           style={{background:'#eff2ff',color:'#4f6ef7'}}>
                        {player.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white text-[13px]">{player.name}</span>
                      {player.isBlacklisted&&<Ban size={12} style={{color:'#dc2626'}}/>}
                    </div>
                  </td>
                  {visibleCols.includes('phone')&&<td className="text-[12px]">{player.phone||'—'}</td>}
                  {visibleCols.includes('status')&&<td><StatusBadge status={player.status}/></td>}
                  {visibleCols.includes('vipLevel')&&<td>
                    {player.vipLevel>0
                      ?<span className="flex items-center gap-1 text-[12px] font-semibold" style={{color:'var(--yellow)'}}><Crown size={11}/>Lv.{player.vipLevel}</span>
                      :<span style={{color:'#9ca3af'}}>—</span>}
                  </td>}
                  {visibleCols.includes('group')&&<td className="text-[12px]">{player.groupName||'—'}</td>}
                  {visibleCols.includes('consultant')&&<td className="text-[12px]">{player.consultant||'—'}</td>}
                  {visibleCols.includes('deposit')&&<td className="val-pos font-semibold text-[12px]">
                    {player.deposit>0?formatCurrency(player.deposit):'—'}
                  </td>}
                  {visibleCols.includes('withdrawal')&&<td className="val-neg font-semibold text-[12px]">
                    {player.withdrawal>0?formatCurrency(player.withdrawal):'—'}
                  </td>}
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>setDetailPlayer(player)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-gray-50"
                              style={{color:'#9ca3af'}}><Eye size={14}/></button>
                      <button onClick={()=>setBlacklistPlayer(player)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-gray-50"
                              style={{color:player.isBlacklisted?'var(--green)':'var(--text-muted)'}}><Ban size={14}/></button>
                      <button onClick={()=>setPlayers(ps=>ps.filter(p=>p.id!==player.id))}
                              className="p-1.5 rounded-lg transition-colors hover:bg-gray-50"
                              style={{color:'#9ca3af'}}
                              onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                              onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 text-[11px]" style={{color:'#9ca3af',borderTop:'1px solid var(--border)'}}>
          {filtered.length} / {players.length}
        </div>
      </div>

      {detailPlayer&&<PlayerDetailModal player={detailPlayer} onClose={()=>setDetailPlayer(null)} onBlacklist={(p:any)=>{setDetailPlayer(null);setBlacklistPlayer(p)}}/>}
      {blacklistPlayer&&<BlacklistModal player={blacklistPlayer} onClose={()=>setBlacklistPlayer(null)} onConfirm={handleBlacklist}/>}
    </div>
  )
}
