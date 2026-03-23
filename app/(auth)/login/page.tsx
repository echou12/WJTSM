'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  async function onSubmit(data: Form) {
    setLoading(true); setError('')
    try {
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false })
      if (result?.error) setError('E-mail ou senha inválidos · Invalid credentials · 邮箱或密码无效')
      else { router.push('/dashboard'); router.refresh() }
    } catch { setError('Erro de conexão') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: '#f5f6f8' }}>
      <div className="w-full max-w-sm">
        {/* Brand header — dark like sidebar */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
               style={{ background: '#1a2332' }}>
            <span className="text-white font-black text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>TSM Dashboard</h1>
          <p className="text-[13px] mt-1" style={{ color: '#6b7280' }}>
            Entrar · Sign in · 登录
          </p>
        </div>

        <div className="tsm-card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg px-4 py-3 text-[13px]"
                   style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#374151' }}>E-mail</label>
              <input {...register('email')} type="email" autoComplete="email"
                     placeholder="seu@email.com" className="tsm-input" />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#374151' }}>Senha</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                       autoComplete="current-password" placeholder="••••••••" className="tsm-input pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#9ca3af' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('rememberMe')} type="checkbox"
                       className="w-3.5 h-3.5 rounded" style={{ accentColor: '#4f6ef7' }} />
                <span className="text-[12px]" style={{ color: '#6b7280' }}>Lembrar de mim</span>
              </label>
              <button type="button" className="text-[12px]" style={{ color: '#4f6ef7' }}>
                Esqueceu a senha?
              </button>
            </div>
            <button type="submit" disabled={loading} className="tsm-btn-primary w-full justify-center py-2.5 text-[14px]">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-[11px]" style={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} TSM Dashboard
        </p>
      </div>
    </div>
  )
}
