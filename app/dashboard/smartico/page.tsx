import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SmarticoPanel from '@/components/dashboard/SmarticoPanel'
export default async function SmarticoPanelPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['superadmin','admin','manager'].includes(session.user.role)) redirect('/dashboard')
  return <SmarticoPanel />
}
