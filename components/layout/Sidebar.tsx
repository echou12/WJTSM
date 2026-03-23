// components/layout/Sidebar.tsx — matches screenshot: dark navy sidebar
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, Users, Search, List, BarChart3,
  Settings, ArrowLeftRight, Wifi, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/types'

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const navItems = [
    { href: '/dashboard',             label: t('dashboard'),   icon: LayoutDashboard },
    { href: '/dashboard/consultants', label: 'Consulta',       icon: Search },
    { href: '/dashboard/players',     label: 'Lista',          icon: List },
    { href: '/dashboard/reports',     label: 'Report',         icon: BarChart3 },
    { href: '/dashboard/users',       label: t('users'),       icon: Users,         roles: ['superadmin','admin'] },
    { href: '/dashboard/groups',      label: 'Transferências', icon: ArrowLeftRight },
    { href: '/dashboard/smartico',    label: 'Smartico',       icon: Wifi,          roles: ['superadmin','admin','manager'] },
    { href: '/dashboard/settings',    label: t('settings'),    icon: Settings },
  ]

  const visible = navItems.filter(i => !i.roles || i.roles.includes(user.role))

  return (
    <aside className="w-44 flex-shrink-0 flex flex-col tsm-sidebar">
      {/* Brand */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-white font-bold text-[15px] leading-tight">TSM Dashboard</p>
        <p className="text-[11px] mt-0.5 capitalize" style={{ color: '#64748b' }}>{user.role}</p>
      </div>

      <div className="mx-3 mb-3" style={{ borderTop: '1px solid #243044' }} />

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {visible.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn('tsm-nav-item', isActive && 'active')}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="text-[13px]">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User at bottom */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #243044' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2d3d55] flex items-center justify-center
                          text-xs font-bold text-white flex-shrink-0">
            N
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate">L...</p>
            <button className="text-[11px]" style={{ color: '#64748b' }}>Sair</button>
          </div>
        </div>
      </div>
    </aside>
  )
}
