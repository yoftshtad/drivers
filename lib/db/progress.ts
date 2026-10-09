import { db, execute, executeOne, executeRun } from './index'
import type { ReadingProgress } from '@/lib/progress-store'

export async function getProgressMap(): Promise<Record<string, ReadingProgress>> {
  try {
    const rows = await execute<any>('SELECT * FROM reading_progress')
    const map: Record<string, ReadingProgress> = {}
    for (const row of rows) {
      map[row.module_id] = {
        percent: row.percent,
        completed: Boolean(row.completed),
        lastReadAt: row.last_read_at,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function getModuleProgress(moduleId: string): Promise<ReadingProgress | undefined> {
  try {
    const row = await executeOne<any>('SELECT * FROM reading_progress WHERE module_id = ?', [moduleId])
    return row ? { percent: row.percent, completed: Boolean(row.completed), lastReadAt: row.last_read_at } : undefined
  } catch {
    return undefined
  }
}

export async function saveReadingProgress(moduleId: string, percent: number, completed = false): Promise<void> {
  const lastReadAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const existing = await getModuleProgress(moduleId)
  const nextPercent = Math.max(existing?.percent ?? 0, Math.round(percent))
  try {
    await executeRun(
      `INSERT INTO reading_progress (module_id, percent, completed, last_read_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(module_id) DO UPDATE SET percent = ?, completed = ?, last_read_at = ?`,
      [moduleId, Math.min(100, nextPercent), completed ? 1 : 0, lastReadAt, Math.min(100, nextPercent), completed ? 1 : 0, lastReadAt]
    )
  } catch {
    // table might not exist
  }
}

export async function deleteModuleProgress(moduleId: string): Promise<void> {
  try {
    await executeRun('DELETE FROM reading_progress WHERE module_id = ?', [moduleId])
  } catch {
    // table might not exist
  }
}