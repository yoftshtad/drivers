'use client'

import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react'
import type { SessionUser, AccessState, UserRole } from '@/lib/types'

export function useAuth() {
  const { data: session, status, update } = useNextAuthSession()

  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    phone: undefined,
    role: session.user.role,
    access: session.user.access,
  } : null

  const loading = status === 'loading'

  return { user, loading }
}

export function useAccessState(): AccessState {
  const { user } = useAuth()
  if (!user) return 'pending'
  if (user.role === 'admin') return 'active'
  if (user.access === 'active') return 'active'
  return 'pending'
}

export function getUser(): SessionUser | null {
  return null
}

export async function signIn(identifier: string, password: string): Promise<SessionUser> {
  throw new Error('Use NextAuth signIn from "next-auth/react"')
}

export async function signUp(name: string, identifier: string): Promise<SessionUser> {
  throw new Error('Use registration API route')
}

export function signOut() {
  nextAuthSignOut({ callbackUrl: '/login' })
}

export function getAccessState(): AccessState {
  return 'pending'
}

export function setAccessState(state: AccessState) {
}

export function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

export { getRejectionReason, setRejectionReason } from './rejection'