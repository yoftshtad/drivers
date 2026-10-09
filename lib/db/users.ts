import { db, execute, executeOne, executeRun } from './index'
import type { AdminUser, AccessState } from '@/lib/types'

export async function getUsers(): Promise<AdminUser[]> {
  return execute<AdminUser>('SELECT * FROM users ORDER BY joined DESC')
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  return executeOne<AdminUser>('SELECT * FROM users WHERE id = ?', [id])
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  return executeOne<AdminUser>('SELECT * FROM users WHERE email = ?', [email])
}

export async function createUser(input: { id: string; name: string; email: string; phone?: string }): Promise<AdminUser> {
  const joined = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  await executeRun(
    'INSERT INTO users (id, name, email, phone, access, joined, attempts) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [input.id, input.name, input.email, input.phone ?? null, 'pending', joined, 0]
  )
  return { id: input.id, name: input.name, email: input.email, phone: input.phone, access: 'pending', joined, attempts: 0 }
}

export async function updateUserAccess(id: string, access: AccessState): Promise<void> {
  await executeRun('UPDATE users SET access = ? WHERE id = ?', [access, id])
}

export async function deleteUser(id: string): Promise<void> {
  await executeRun('DELETE FROM users WHERE id = ?', [id])
}

export async function incrementUserAttempts(id: string): Promise<void> {
  await executeRun('UPDATE users SET attempts = attempts + 1 WHERE id = ?', [id])
}