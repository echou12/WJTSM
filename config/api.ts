// config/api.ts
// API REPLACEABLE: Single source of truth for all endpoint paths

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',

  ENDPOINTS: {
    auth: {
      login: '/api/auth/callback/credentials',
      logout: '/api/auth/signout',
    },
    users: {
      list: '/api/users',
      create: '/api/users',
      update: (id: string) => `/api/users/${id}`,
      delete: (id: string) => `/api/users/${id}`,
    },
    players: {
      list: '/api/players',
      create: '/api/players',
      update: (id: string) => `/api/players/${id}`,
      delete: (id: string) => `/api/players/${id}`,
      blacklist: (id: string) => `/api/players/${id}/blacklist`,
    },
    groups: {
      list: '/api/groups',
      create: '/api/groups',
      update: (id: string) => `/api/groups/${id}`,
      delete: (id: string) => `/api/groups/${id}`,
    },
    transfers: {
      list: '/api/transfers',
      create: '/api/transfers',
    },
    dashboard: {
      stats: '/api/dashboard/stats',
    },
    // ── SMARTICO ─────────────────────────────────────────────────────────────
    smartico: {
      events: '/api/smartico/events',
      sync: '/api/smartico/sync',
      players: '/api/smartico/players',
    },
  },
}

export function apiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
