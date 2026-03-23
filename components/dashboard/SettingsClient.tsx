'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Globe, Lock, User, Bell, CheckCircle, Save } from 'lucide-react'
import type { SessionUser } from '@/types'

const LOCALES=[
  {code:'pt',label:'Português',flag:'🇧🇷',desc:'Idioma padrão'},
  {code:'en',label:'English',  flag:'🇺🇸',desc:'Default language'},
  {code:'zh',label:'简体中文',  flag:'🇨🇳',desc:'系统默认语言'},
]

export default function SettingsClient({user}:{user:SessionUser}) {
  const router=useRouter()
  const t =useTranslations('settings')
  const tc=useTranslations('common')
  const [locale,setLocale]=useState('pt')
  const [saved,setSaved]=useState('')
  const [tab,setTab]=useState<'language'|'profile'|'security'|'notifications'>('language')

  async function saveLocale(code:string) {
    setLocale(code)
    await fetch('/api/locale',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({locale:code})})
    setSaved('Language updated! / Idioma atualizado! / 语言已更新！')
    setTimeout(()=>{setSaved('');router.refresh()},1500)
  }

  const tabs=[
    {key:'language',label:t('language'),icon:Globe},
    {key:'profile', label:t('profile'), icon:User},
    {key:'security',label:t('security'),icon:Lock},
    {key:'notifications',label:t('notifications'),icon:Bell},
  ] as const

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>Manage your preferences</p>
      </div>

      {saved&&(
        <div className="rounded-xl px-4 py-3 text-[13px] flex items-center gap-2"
             style={{background:'#f0fdf4',color:'#16a34a',border:'1px solid rgba(16,185,129,0.25)'}}>
          <CheckCircle size={15}/>{saved}
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl" style={{background:'#fff',border:'1px solid #e5e7eb'}}>
        {tabs.map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium transition-all
                              ${tab===tb.key?'text-white':'hover:text-white'}`}
                  style={tab===tb.key?{background:'var(--accent)',color:'white'}:{color:'#9ca3af'}}>
            <tb.icon size={13}/><span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {tab==='language'&&(
        <div className="tsm-card p-5 space-y-3">
          <p className="font-semibold text-white text-[14px] mb-1">{t('language')}</p>
          <p className="text-[12px] mb-4" style={{color:'#9ca3af'}}>Select interface language</p>
          {LOCALES.map(l=>(
            <div key={l.code} onClick={()=>saveLocale(l.code)}
                 className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                 style={{border:`2px solid ${locale===l.code?'var(--accent)':'var(--border)'}`,
                         background:locale===l.code?'#eff2ff':'var(--bg-surface)'}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{l.flag}</span>
                <div>
                  <p className="font-medium text-white text-[14px]">{l.label}</p>
                  <p className="text-[11px]" style={{color:'#9ca3af'}}>{l.desc}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                              ${locale===l.code?'border-[var(--accent)] bg-[var(--accent)]':'border-gray-200'}`}>
                {locale===l.code&&<span className="w-2 h-2 rounded-full bg-white"/>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='profile'&&(
        <div className="tsm-card p-5 space-y-4">
          <div className="flex items-center gap-4 pb-4" style={{borderBottom:'1px solid #e5e7eb'}}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                 style={{background:'#eff2ff',color:'#4f6ef7',border:'2px solid rgba(14,165,233,0.3)'}}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-lg">{user.name}</p>
              <p className="text-[13px]" style={{color:'#9ca3af'}}>{user.email}</p>
              <p className="text-[11px] capitalize mt-1" style={{color:'#4f6ef7'}}>{user.role}</p>
            </div>
          </div>
          {[{label:'Name',val:user.name||'',type:'text'},{label:'Email',val:user.email||'',type:'email'}].map(f=>(
            <div key={f.label}>
              <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>{f.label}</label>
              <input defaultValue={f.val} type={f.type} className="tsm-input"/>
            </div>
          ))}
          <button className="tsm-btn-primary text-[13px]"><Save size={14}/> {tc('save')}</button>
        </div>
      )}

      {tab==='security'&&(
        <div className="tsm-card p-5 space-y-4">
          <p className="font-semibold text-white text-[14px]">{t('security')}</p>
          {['Current Password','New Password','Confirm New Password'].map(l=>(
            <div key={l}>
              <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>{l}</label>
              <input type="password" placeholder="••••••••" className="tsm-input"/>
            </div>
          ))}
          <button className="tsm-btn-primary text-[13px]"><Lock size={14}/> Change Password</button>
        </div>
      )}

      {tab==='notifications'&&(
        <div className="tsm-card p-5 space-y-1">
          <p className="font-semibold text-white text-[14px] mb-4">{t('notifications')}</p>
          {[
            {label:'New player registrations',desc:'Alert when a new player is added'},
            {label:'High-value transfers',desc:'Alerts for deposits & withdrawals over R$10,000'},
            {label:'Blacklisted players',desc:'Notification when a player is banned'},
          ].map((n,i)=>(
            <div key={i} className="flex items-center justify-between py-3.5" style={{borderBottom:'1px solid #e5e7eb'}}>
              <div>
                <p className="text-[13px] font-medium text-white">{n.label}</p>
                <p className="text-[11px] mt-0.5" style={{color:'#9ca3af'}}>{n.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked={i===0} className="sr-only peer"/>
                <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white
                                after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                                after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"
                     style={{background:'var(--border)'}}/>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
