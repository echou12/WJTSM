// app/dashboard/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f6f8' }}>
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav user={session.user} />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: '#f5f6f8' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
