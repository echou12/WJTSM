// types/index.ts
// Central types file - all shared TypeScript types

import { UserRole, PlayerStatus, TransferType } from '@prisma/client'

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
  }
  interface Session {
    user: SessionUser
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string | Date
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  isActive?: boolean
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────

export interface PlayerRow {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  status: PlayerStatus
  vipLevel: number
  groupId?: string | null
  groupName?: string | null
  consultantId?: string | null
  consultantName?: string | null
  isBlacklisted: boolean
  blacklistNote?: string | null
  notes?: string | null
  totalDeposit?: number
  totalWithdrawal?: number
  createdAt: string | Date
}

export interface CreatePlayerInput {
  name: string
  phone?: string
  email?: string
  status?: PlayerStatus
  vipLevel?: number
  groupId?: string
  consultantId?: string
  notes?: string
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────

export interface GroupRow {
  id: string
  name: string
  description?: string | null
  consultantId?: string | null
  consultantName?: string | null
  playerCount?: number
  totalDeposits?: number
  totalWithdrawals?: number
  isActive: boolean
  createdAt: string | Date
}

// ─── TRANSFERS ───────────────────────────────────────────────────────────────

export interface TransferRow {
  id: string
  playerId: string
  playerName?: string
  type: TransferType
  amount: number
  currency: string
  houseProfit?: number | null
  note?: string | null
  transferAt: string | Date
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export interface DashboardPlayerDetail {
  id: string
  name: string
  phone?: string | null
  status: string
  deposit: number
  withdrawal: number
  houseProfit: number
  hasActivity: boolean
}

export interface DashboardGroupSummary {
  groupName: string
  consultant?: string | null
  deposits: number
  withdrawals: number
  net: number
  players: DashboardPlayerDetail[]
}

export interface DashboardStats {
  today: {
    totalDeposits: number
    totalWithdrawals: number
    netBalance: number
    houseProfit: number
    activePlayers: number
    newPlayers: number
  }
  vip: {
    deposits: number
    withdrawals: number
    net: number
    players: DashboardPlayerDetail[]
  }
  groups: DashboardGroupSummary[]
  weekly: { day: string; deposits: number; withdrawals: number }[]
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
