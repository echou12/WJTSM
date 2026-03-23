// app/api/locale/route.ts
// Sets the locale cookie for language switching
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { locale } = await req.json()
  const validLocales = ['pt', 'en', 'zh']
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
  return res
}
