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

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users', { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.users ?? []
}

export async function getUsers(): Promise<AdminUser[]> {
  if (typeof window === 'undefined') return []
  return fetchUsers()
}

export async function createUser(input: { id: string; name: string; email: string; phone?: string }): Promise<AdminUser> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create user')
  const data = await res.json()
  return data.user
}

export async function updateUserAccess(id: string, access: AccessState): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access }),
  })
  if (!res.ok) throw new Error('Failed to update user')
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete user')
}

export function subscribeUsers(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.users-change', listener)
  return () => window.removeEventListener('dp.users-change', listener)
}

export function useUsers(): AdminUser[] {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchUsers()
      if (mounted) {
        setUsers(data)
        setLoading(false)
      }
    }
    load()
    const unsub = subscribeUsers(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return users
}