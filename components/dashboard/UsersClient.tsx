// components/dashboard/UsersClient.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, Loader2, X, Search, Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { formatDate, getRoleColor } from '@/lib/utils'
import type { UserRow, SessionUser } from '@/types'
import { UserRole } from '@prisma/client'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().optional(),
})
type Form = z.infer<typeof schema>

const ROLES = [
  { value:'superadmin', key:'superadmin' },
  { value:'admin',      key:'admin'      },
  { value:'manager',    key:'manager'    },
  { value:'consultant', key:'consultant' },
]

export default function UsersClient({ currentUser }: { currentUser: SessionUser }) {
  const t  = useTranslations('users')
  const tc = useTranslations('common')
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser]   = useState<UserRow|null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRow|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, reset, formState:{errors} } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: UserRole.consultant, isActive: true },
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      setUsers(json.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(()=>{ fetchUsers() },[fetchUsers])

  function openCreate() { setEditUser(null); reset({ role:UserRole.consultant, isActive:true, name:'', email:'', password:'' }); setModalOpen(true); setError('') }
  function openEdit(u: UserRow) { setEditUser(u); reset({ name:u.name, email:u.email, role:u.role, isActive:u.isActive, password:'' }); setModalOpen(true); setError('') }

  async function onSubmit(data: Form) {
    setSubmitting(true); setError('')
    try {
      if (!editUser && !data.password) { setError('Password required'); return }
      const body: any = { name:data.name, email:data.email, role:data.role, isActive:data.isActive }
      if (data.password) body.password = data.password
      const res = await fetch(editUser ? `/api/users/${editUser.id}` : '/api/users', {
        method: editUser ? 'PATCH' : 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error'); return }
      setSuccess(editUser ? 'Updated!' : 'Created!')
      setModalOpen(false); fetchUsers()
      setTimeout(()=>setSuccess(''),3000)
    } finally { setSubmitting(false) }
  }

  async function handleDelete(u: UserRow) {
    const res = await fetch(`/api/users/${u.id}`,{method:'DELETE'})
    if (res.ok) { setSuccess('Deleted!'); setDeleteTarget(null); fetchUsers(); setTimeout(()=>setSuccess(''),3000) }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-[13px] mt-1" style={{color:'#9ca3af'}}>{users.length} accounts</p>
        </div>
        <button onClick={openCreate} className="tsm-btn-primary"><Plus size={15}/> {t('addUser')}</button>
      </div>

      {success && (
        <div className="rounded-xl px-4 py-3 text-[13px] flex items-center gap-2"
             style={{background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0'}}>
          <CheckCircle size={15}/> {success}
        </div>
      )}

      <div className="tsm-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #e5e7eb'}}>
          <div className="relative w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9ca3af'}} />
            <input value={search} onChange={e=>setSearch(e.target.value)}
                   placeholder={`${tc('search')} users...`} className="tsm-input pl-9 py-2 text-[13px]" />
          </div>
          <button onClick={fetchUsers} className="tsm-btn-ghost text-[12px]">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="tsm-table">
            <thead><tr>
              <th>{t('name')}</th><th>{t('role')}</th>
              <th>{t('active')}</th><th>{t('createdAt')}</th><th className="text-right">{tc('actions')}</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="tsm-empty"><Loader2 size={22} className="animate-spin" style={{color:'#4f6ef7'}} /></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5}><div className="tsm-empty">{tc('noData')}</div></td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                           style={{background:'#eff2ff',color:'#4f6ef7'}}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-[13px]">{user.name}</p>
                        <p className="text-[11px]" style={{color:'#9ca3af'}}>{user.email}</p>
                      </div>
                      {user.id === currentUser.id && (
                        <span className="tsm-badge badge-blue text-[10px]">You</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`tsm-badge ${getRoleColor(user.role)}`}>
                      <Shield size={10}/> {t(`roles.${user.role}`)}
                    </span>
                  </td>
                  <td>
                    {user.isActive
                      ? <span className="tsm-badge badge-green"><CheckCircle size={10}/> {tc('status.active')}</span>
                      : <span className="tsm-badge badge-slate"><XCircle size={10}/> {tc('status.inactive')}</span>}
                  </td>
                  <td className="text-[12px]">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>openEdit(user)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-gray-50"
                              style={{color:'#9ca3af'}}>
                        <Pencil size={14}/>
                      </button>
                      {currentUser.role==='superadmin' && user.id!==currentUser.id && (
                        <button onClick={()=>setDeleteTarget(user)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{color:'#9ca3af'}}
                                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                                onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 text-[11px]" style={{color:'#9ca3af',borderTop:'1px solid var(--border)'}}>
          {filtered.length} / {users.length} users
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="tsm-overlay" onClick={()=>setModalOpen(false)}>
          <div className="tsm-modal w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid #e5e7eb'}}>
              <h2 className="text-[15px] font-semibold text-white">
                {editUser ? t('editUser') : t('addUser')}
              </h2>
              <button onClick={()=>setModalOpen(false)} style={{color:'#9ca3af'}}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto">
              {error && (
                <div className="rounded-lg px-3 py-2.5 text-[13px]"
                     style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>{t('name')}</label>
                <input {...register('name')} placeholder="Full name" className="tsm-input" />
                {errors.name && <p className="text-[11px] mt-1 val-neg">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>{t('email')}</label>
                <input {...register('email')} type="email" placeholder="email@domain.com" className="tsm-input" />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>
                  {t('password')} {editUser && <span style={{color:'#9ca3af',fontWeight:400}}>(leave blank to keep)</span>}
                </label>
                <input {...register('password')} type="password" placeholder="Min 8 chars" className="tsm-input" />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{color:'#6b7280'}}>{t('role')}</label>
                <select {...register('role')} className="tsm-input">
                  {ROLES.filter(r => currentUser.role==='superadmin' || r.value!=='superadmin').map(r=>(
                    <option key={r.value} value={r.value}>{t(`roles.${r.key}`)}</option>
                  ))}
                </select>
              </div>
              {editUser && (
                <label className="flex items-center justify-between">
                  <span className="text-[13px]" style={{color:'#6b7280'}}>{t('active')}</span>
                  <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-sky-500" />
                </label>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setModalOpen(false)} className="tsm-btn-ghost flex-1 justify-center">
                  {tc('cancel')}
                </button>
                <button type="submit" disabled={submitting} className="tsm-btn-primary flex-1 justify-center">
                  {submitting && <Loader2 size={14} className="animate-spin"/>}
                  {editUser ? tc('save') : t('addUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="tsm-overlay" onClick={()=>setDeleteTarget(null)}>
          <div className="tsm-modal w-full max-w-sm p-6 text-center" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{background:'#fef2f2',border:'1px solid rgba(244,63,94,0.25)'}}>
              <Trash2 size={20} style={{color:'#dc2626'}} />
            </div>
            <h3 className="font-semibold text-white mb-2">{t('deleteUser')}</h3>
            <p className="text-[13px] mb-5" style={{color:'#6b7280'}}>
              Delete <strong className="text-white">{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteTarget(null)} className="tsm-btn-ghost flex-1 justify-center">{tc('cancel')}</button>
              <button onClick={()=>handleDelete(deleteTarget)} className="tsm-btn-danger flex-1 justify-center">{tc('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
