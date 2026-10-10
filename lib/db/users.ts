import { db, execute, executeOne, executeRun } from './index'
import type { AdminUser, AccessState } from '@/lib/types'

function rowToUser(row: any): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    access: row.access_state,
    joined: row.joined_at,
    attempts: 0, // not in schema, default to 0
  }
}

export async function getUsers(): Promise<AdminUser[]> {
  const rows = await execute<any>('SELECT * FROM users ORDER BY joined_at DESC')
  return rows.map(rowToUser)
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  const row = await executeOne<any>('SELECT * FROM users WHERE id = ?', [id])
  return row ? rowToUser(row) : null
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const row = await executeOne<any>('SELECT * FROM users WHERE email = ?', [email])
  return row ? rowToUser(row) : null
}

export async function createUser(input: { id: string; name: string; email: string; phone?: string }): Promise<AdminUser> {
  const joined = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const now = new Date().toISOString()
  await executeRun(
    `INSERT INTO users (id, name, email, phone, role, plan, access_state, joined_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.id, input.name, input.email, input.phone ?? null, 'student', 'free', 'pending', joined, now, now]
  )
  return { id: input.id, name: input.name, email: input.email, phone: input.phone, access: 'pending', joined, attempts: 0 }
}

export async function updateUserAccess(id: string, access: AccessState): Promise<void> {
  const now = new Date().toISOString()
  const plan = access === 'active' ? 'premium' : 'free'
  await executeRun('UPDATE users SET access_state = ?, plan = ?, updated_at = ? WHERE id = ?', [access, plan, now, id])
}

export async function deleteUser(id: string): Promise<void> {
  await executeRun('DELETE FROM users WHERE id = ?', [id])
}

export async function incrementUserAttempts(id: string): Promise<void> {
  // attempts column doesn't exist in schema, skip
}