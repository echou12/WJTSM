// app/dashboard/settings/page.tsx
import { auth } from '@/lib/auth'
import SettingsClient from '@/components/dashboard/SettingsClient'
export default async function SettingsPage() {
  const session = await auth()
  return <SettingsClient user={session!.user} />
}
