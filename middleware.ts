// middleware.ts
// Protects all /dashboard/* routes — redirects unauthenticated users to /login

export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/users/:path*',
    '/api/players/:path*',
    '/api/groups/:path*',
    '/api/transfers/:path*',
    '/api/dashboard/:path*',
  ],
}
