import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
}

export const db = createClient({ url, authToken })

export async function execute<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args })
  return result.rows as T[]
}

export async function executeOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const rows = await execute<T>(sql, args)
  return rows[0] ?? null
}

export async function executeRun(sql: string, args: any[] = []): Promise<{ lastInsertRowid: string | null; changes: number }> {
  const result = await db.execute({ sql, args })
  return { lastInsertRowid: result.lastInsertRowid?.toString() ?? null, changes: result.rowsAffected }
}