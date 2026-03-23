// middleware.ts
// Lightweight edge middleware — only checks JWT session token
// Does NOT import bcryptjs or Prisma to stay under 1MB edge limit

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for session cookie (next-auth sets this)
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/users') ||
    pathname.startsWith('/api/players') ||
    pathname.startsWith('/api/groups') ||
    pathname.startsWith('/api/transfers') ||
    pathname.startsWith('/api/dashboard')

  if (isProtected && !sessionToken) {
    // API routes return 401, page routes redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

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
