// app/dashboard/users/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersClient from '@/components/dashboard/UsersClient'

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Only admin+ can access
  if (!['superadmin', 'admin'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return <UsersClient currentUser={session.user} />
}
