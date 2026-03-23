// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLive from '@/components/dashboard/DashboardLive'
import { getDashboardStats } from '@/lib/dashboard-stats'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const { stats, source } = await getDashboardStats()

  return (
    <DashboardLive
      stats={stats}
      userName={session.user.name || 'User'}
      userRole={session.user.role}
      dataSource={source}
    />
  )
}
