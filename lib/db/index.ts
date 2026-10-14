import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
}

export const db = createClient({ 
  url, 
  authToken,
  // Increase timeout to 60 seconds for slow connections
  fetchOptions: {
    timeout: 60000,
  }
})

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (retries <= 0) throw e
    await new Promise(r => setTimeout(r, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}

export async function execute<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  return withRetry(async () => {
    const result = await db.execute({ sql, args })
    return result.rows as T[]
  })
}

export async function executeOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  return withRetry(async () => {
    const rows = await execute<T>(sql, args)
    return rows[0] ?? null
  })
}

export async function executeRun(sql: string, args: any[] = []): Promise<{ lastInsertRowid: string | null; changes: number }> {
  return withRetry(async () => {
    const result = await db.execute({ sql, args })
    return { lastInsertRowid: result.lastInsertRowid?.toString() ?? null, changes: result.rowsAffected }
  })
}