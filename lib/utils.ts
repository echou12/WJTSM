import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatNumber(n: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale).format(n)
}

export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: Date | string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    superadmin: 'badge-purple',
    admin:      'badge-red',
    manager:    'badge-blue',
    consultant: 'badge-green',
  }
  return map[role] || 'badge-gray'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active:      'badge-green',
    inactive:    'badge-gray',
    vip:         'badge-yellow',
    blacklisted: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export function canAccess(userRole: string, requiredRole: string): boolean {
  const hierarchy: Record<string, number> = { superadmin: 4, admin: 3, manager: 2, consultant: 1 }
  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0)
}
