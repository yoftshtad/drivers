'use client'

import type { AccessState, UserRole } from './types'
import { authClient } from './auth-client'
const phoneEmail = (phone: string) => `${phone.replace(/\D/g, '')}@phone.driveprep.invalid`

export interface SessionUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  plan: 'free' | 'premium'
}

// Single admin credential — only this exact email + password gets admin access
const ADMIN_EMAIL = 'admin@driveprep.com'
const ADMIN_PASSWORD = 'driveprep2024'

const USER_KEY = 'dp.user'
const ACCESS_KEY = 'dp.access'
const REJECTION_KEY = 'dp.rejection'
const EVENT = 'dp.session-change'

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event(EVENT))
}

export function subscribe(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function getUser(): SessionUser | null {
  return read<SessionUser>(USER_KEY)
}

export async function signIn(identifier: string, password: string): Promise<SessionUser> {
  const normalized = identifier.trim()
  const isAdmin = normalized.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD
  if (!isAdmin) {
    const result = await authClient.signIn.email({ email: normalized.includes('@') ? normalized : phoneEmail(normalized), password })
    if (result.error) throw new Error('Invalid credentials')
  }
  const isEmail = normalized.includes('@')
  const user: SessionUser = {
    id: isAdmin ? 'u-admin' : `auth-${normalized}`,
    name: isAdmin ? 'Admin' : (isEmail ? normalized.split('@')[0] : normalized),
    email: isEmail ? normalized : '',
    phone: isEmail ? undefined : normalized,
    role: isAdmin ? 'admin' : 'student',
    plan: isAdmin ? 'premium' : 'free',
  }
  write(USER_KEY, user)
  if (isAdmin) write(ACCESS_KEY, 'active')
  return user
}

export async function signUp(name: string, identifier: string, password: string): Promise<SessionUser> {
  const isEmail = identifier.includes('@')
  const email = isEmail ? identifier.trim() : phoneEmail(identifier)
  const result = await authClient.signUp.email({ email, password, name })
  if (result.error) throw new Error('Unable to create account')
  const user: SessionUser = {
    id: result.data?.user?.id ?? `auth-${identifier}`,
    name,
    email: isEmail ? identifier : '',
    phone: isEmail ? undefined : identifier,
    role: 'student',
    plan: 'free',
  }
  write(USER_KEY, user)
  setAccessState('pending')
  return user
}

export function signOut() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REJECTION_KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function getAccessState(): AccessState {
  return read<AccessState>(ACCESS_KEY) ?? 'pending'
}

export function setAccessState(state: AccessState) {
  write(ACCESS_KEY, state)
}

export function getRejectionReason(): string {
  return read<string>(REJECTION_KEY) ?? 'The uploaded receipt could not be verified. Please make sure the amount, reference number and date are clearly visible.'
}

export function setRejectionReason(reason: string) {
  write(REJECTION_KEY, reason)
}

export function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

// Fetch user access from database and sync localStorage
export async function syncUserAccess(identifier: string): Promise<AccessState | null> {
  if (typeof window === 'undefined') return null
  try {
    const isEmail = identifier.includes('@')
    const url = isEmail 
      ? `/api/admin/users?email=${encodeURIComponent(identifier)}`
      : `/api/admin/users?phone=${encodeURIComponent(identifier)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const user = data.users?.[0]
    if (user) {
      write(ACCESS_KEY, user.access)
      return user.access
    }
  } catch (e) {
    console.error('Failed to sync user access:', e)
  }
  return null
}
