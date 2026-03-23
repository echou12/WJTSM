import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'pt'
  const validLocales = ['pt', 'en', 'zh']
  const safeLocale = validLocales.includes(locale) ? locale : 'pt'

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  }
})
