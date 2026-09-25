'use client'

import { useEffect, useState } from 'react'
import type { AccessState } from './types'

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  access: AccessState
  joined: string
  attempts: number
}

const KEY = 'dp.users'
const EVENT = 'dp.users-change'

export function getUsers(): AdminUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const users = JSON.parse(raw) as AdminUser[]
    const uniqueUsers = new Map<string, AdminUser>()
    for (const user of users) {
      if (!uniqueUsers.has(user.id)) uniqueUsers.set(user.id, user)
    }
    return Array.from(uniqueUsers.values())
  } catch {
    return []
  }
}

export function createUser(input: { id: string; name: string; email: string; phone?: string }): AdminUser {
  if (typeof window === 'undefined') return null as any
  const user: AdminUser = {
    id: input.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    access: 'pending',
    joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    attempts: 0,
  }
  const users = getUsers()
  window.localStorage.setItem(KEY, JSON.stringify([user, ...users]))
  window.dispatchEvent(new Event(EVENT))
  return user
}

export function updateUserAccess(id: string, access: AccessState) {
  if (typeof window === 'undefined') return
  const users = getUsers().map((u) => (u.id === id ? { ...u, access } : u))
  window.localStorage.setItem(KEY, JSON.stringify(users))
  window.dispatchEvent(new Event(EVENT))
}

export function deleteUser(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(getUsers().filter((u) => u.id !== id)))
  window.dispatchEvent(new Event(EVENT))
}

export function subscribeUsers(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useUsers(): AdminUser[] {
  const [users, setUsers] = useState<AdminUser[]>([])
  useEffect(() => {
    const sync = () => setUsers(getUsers())
    sync()
    return subscribeUsers(sync)
  }, [])
  return users
}