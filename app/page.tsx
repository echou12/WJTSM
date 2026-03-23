// app/page.tsx
// Root page: redirect to dashboard (middleware handles auth check)
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
