'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, TrendingUp, BarChart2, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { mockReports } from '@/lib/mock-data'

const COLORS = ['#0ea5e9','#10b981','#f59e0b','#f43f5e','#8b5cf6']

function ChartTooltip({active,payload,label}:any) {
  if (!active||!payload?.length) return null
  return (
    <div className="tsm-card px-4 py-3 shadow-2xl text-[12px]">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((e:any)=>(
        <p key={e.name} style={{color:e.color}}>{e.name}: {formatCurrency(e.value)}</p>
      ))}
    </div>
  )
}

export default function ReportsClient() {
  const t = useTranslations('reports')
  const [view,setView]=useState<'chart'|'group'>('chart')
  const total={dep:mockReports.monthly.reduce((s,m)=>s+m.deposits,0),wit:mockReports.monthly.reduce((s,m)=>s+m.withdrawals,0),profit:mockReports.monthly.reduce((s,m)=>s+m.profit,0)}

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>{t('performance')} · {new Date().getFullYear()}</p>
        </div>
        <button className="tsm-btn-ghost text-[13px]"><Download size={14}/> {t('export')}</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {label:'Annual Deposits',    val:formatCurrency(total.dep),    color:'val-pos', icon:TrendingUp,  bg:'bg-emerald-500/20'},
          {label:'Annual Withdrawals', val:formatCurrency(total.wit),    color:'val-neg', icon:BarChart2,   bg:'bg-rose-500/20'},
          {label:'Net Profit',         val:formatCurrency(total.profit), color:'text-white',icon:Calendar, bg:'bg-sky-500/20'},
        ].map((s,i)=>(
          <div key={i} className="tsm-card p-5 flex items-center gap-4">
            <div className={`icon-box ${s.bg}`}><s.icon size={16} className="text-white"/></div>
            <div>
              <p className="tsm-section-title">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['chart','group'] as const).map(v=>(
          <button key={v} onClick={()=>setView(v)}
                  className={v===view?'tsm-btn-primary text-[12px] py-1.5':'tsm-btn-ghost text-[12px] py-1.5'}>
            {v==='chart'?t('monthly'):t('byGroup')}
          </button>
        ))}
      </div>

      {view==='chart'&&(
        <div className="tsm-card p-5">
          <p className="font-semibold text-white text-[14px] mb-5">{t('monthly')} — Dep · Saq · Lucro</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockReports.monthly} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis stroke="var(--text-muted)" tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<ChartTooltip/>} cursor={{fill:'rgba(255,255,255,0.02)'}}/>
              <Bar dataKey="deposits" name="Deposits" fill="var(--green)" radius={[4,4,0,0]}/>
              <Bar dataKey="withdrawals" name="Withdrawals" fill="var(--red)" radius={[4,4,0,0]}/>
              <Bar dataKey="profit" name="Profit" fill="var(--accent)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view==='group'&&(
        <>
          <div className="tsm-card overflow-hidden">
            <div className="px-5 py-3.5" style={{borderBottom:'1px solid #e5e7eb'}}>
              <p className="font-semibold text-white text-[14px]">{t('byGroup')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="tsm-table">
                <thead><tr><th>Group</th><th>Players</th><th>Deposits</th><th>Withdrawals</th><th>Profit</th><th>%</th></tr></thead>
                <tbody>
                  {mockReports.byGroup.map((g,i)=>{
                    const pct=g.deposits>0?((g.profit/g.deposits)*100).toFixed(1):'0'
                    return (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                            <span className="font-medium text-white text-[13px]">{g.group}</span>
                          </div>
                        </td>
                        <td className="text-[12px]">{g.playerCount}</td>
                        <td className="val-pos font-semibold text-[13px]">{formatCurrency(g.deposits)}</td>
                        <td className="val-neg font-semibold text-[13px]">{formatCurrency(g.withdrawals)}</td>
                        <td className="font-bold text-[13px]" style={{color:'#4f6ef7'}}>{formatCurrency(g.profit)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
                              <div className="h-full rounded-full" style={{width:`${Math.min(parseFloat(pct),100)}%`,background:'var(--accent)'}}/>
                            </div>
                            <span className="text-[11px]" style={{color:'#9ca3af'}}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot><tr>
                  <td className="font-bold text-white uppercase text-[11px] tracking-wider">Total</td>
                  <td className="font-bold">{mockReports.byGroup.reduce((s,g)=>s+g.playerCount,0)}</td>
                  <td className="val-pos font-bold">{formatCurrency(total.dep)}</td>
                  <td className="val-neg font-bold">{formatCurrency(total.wit)}</td>
                  <td className="font-bold" style={{color:'#4f6ef7'}}>{formatCurrency(total.profit)}</td>
                  <td/>
                </tr></tfoot>
              </table>
            </div>
          </div>
          <div className="tsm-card p-5">
            <p className="font-semibold text-white text-[14px] mb-4">Distribution by Group</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={mockReports.byGroup} dataKey="deposits" nameKey="group" cx="50%" cy="50%" outerRadius={85} paddingAngle={3}
                     label={({group,percent}:any)=>`${group} ${(percent*100).toFixed(0)}%`}
                     labelLine={{stroke:'var(--border)'}}>
                  {mockReports.byGroup.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v:any)=>formatCurrency(v)}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
