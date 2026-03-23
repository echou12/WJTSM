// components/layout/TopNav.tsx — dark header bar matching screenshot
'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Globe, ChevronDown, LogOut } from 'lucide-react'
import type { SessionUser } from '@/types'

const LOCALES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'zh', label: '中文',       flag: '🇨🇳' },
]

export default function TopNav({ user }: { user: SessionUser }) {
  const router = useRouter()
  const t = useTranslations()
  const [langMenu, setLangMenu]   = useState(false)
  const [userMenu, setUserMenu]   = useState(false)
  const [locale,   setLocale]     = useState('pt')

  async function switchLocale(code: string) {
    setLocale(code); setLangMenu(false)
    await fetch('/api/locale', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code }),
    })
    router.refresh()
  }

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const curLang = LOCALES.find(l => l.code === locale) || LOCALES[0]

  return (
    /* Dark header matching the screenshot */
    <header className="h-12 flex items-center justify-between px-5 flex-shrink-0"
            style={{ background: '#1a2332', borderBottom: '1px solid #243044' }}>
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <span className="text-white font-semibold text-[15px]">Dashboard TSM</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Language */}
        <div className="relative">
          <button onClick={() => { setLangMenu(!langMenu); setUserMenu(false) }}
                  className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg
                             transition-colors hover:bg-[#243044]"
                  style={{ color: '#94a3b8' }}>
            <Globe size={13} />
            <span>{curLang.flag}</span>
            <ChevronDown size={11} />
          </button>
          {langMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-xl z-20 overflow-hidden"
                   style={{ background: '#1e2d42', border: '1px solid #2d3d55' }}>
                {LOCALES.map(l => (
                  <button key={l.code} onClick={() => switchLocale(l.code)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] transition-colors hover:bg-[#243044]"
                          style={{ color: locale === l.code ? '#4f6ef7' : '#94a3b8' }}>
                    <span>{l.flag}</span><span>{l.label}</span>
                    {locale === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4f6ef7]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User info — matching "@eddie • SUPERVISOR" from screenshot */}
        <div className="relative">
          <button onClick={() => { setUserMenu(!userMenu); setLangMenu(false) }}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[#243044] transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-[11px] leading-tight" style={{ color: '#64748b' }}>
                @{user.email?.split('@')[0]} • {user.role.toUpperCase()}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
              className="text-[12px] px-3 py-1.5 rounded font-medium transition-colors hover:bg-red-600"
              style={{ background: '#dc2626', color: 'white' }}>
              Sair
            </button>
          </button>
        </div>
      </div>
    </header>
  )
}
