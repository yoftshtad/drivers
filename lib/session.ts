'use client'

import type { AccessState, UserRole } from './types'
import { createUser } from './users-store'

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

export function signIn(identifier: string, password: string): SessionUser {
  const normalized = identifier.trim().toLowerCase()
  const isAdmin = normalized === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD
  const role: UserRole = isAdmin ? 'admin' : 'student'
  const isEmail = identifier.includes('@')
  const user: SessionUser = {
    id: role === 'admin' ? 'u-admin' : 'u-student',
    name: isEmail ? identifier.split('@')[0]?.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : identifier,
    email: isEmail ? identifier : '',
    phone: isEmail ? undefined : identifier,
    role,
    plan: role === 'admin' ? 'premium' : 'free',
  }
  write(USER_KEY, user)
  if (role === 'admin') {
    write(ACCESS_KEY, 'active')
  }
  return user
}

export function signUp(name: string, identifier: string): SessionUser {
  const isEmail = identifier.includes('@')
  const user: SessionUser = {
    id: `u-${crypto.randomUUID()}`,
    name,
    email: isEmail ? identifier : '',
    phone: isEmail ? undefined : identifier,
    role: 'student',
    plan: 'free',
  }
  write(USER_KEY, user)
  setAccessState('pending')
  // Also create in admin users store
  if (typeof window !== 'undefined') {
    createUser({ id: user.id, name, email: user.email, phone: user.phone })
  }
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
