import { db, execute, executeOne, executeRun } from './index'
import type { LearningModule, ModuleColor, ModuleContent } from '@/lib/types'

function rowToModule(row: any): LearningModule {
  return {
    id: row.id,
    order: row.order_num,
    title: row.title,
    description: row.description,
    color: row.color,
    progress: row.progress,
    questionCount: row.question_count,
    lessons: [], // not in schema
    content: undefined, // not in schema
  }
}

export async function getModules(): Promise<LearningModule[]> {
  const rows = await execute<any>('SELECT * FROM modules ORDER BY order_num')
  return rows.map(rowToModule)
}

export async function getModule(id: string): Promise<LearningModule | undefined> {
  const row = await executeOne<any>('SELECT * FROM modules WHERE id = ?', [id])
  return row ? rowToModule(row) : undefined
}

export async function createModule(input: { title: string; description: string; color: ModuleColor; order: number }): Promise<LearningModule> {
  const id = `mod-${Date.now().toString(36)}`
  const now = new Date().toISOString()
  await executeRun(
    `INSERT INTO modules (id, order_num, title, description, color, progress, question_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.order, input.title, input.description, input.color, 0, 0, now, now]
  )
  return { ...input, id, progress: 0, questionCount: 0, lessons: [] }
}

export async function updateModule(id: string, patch: Partial<LearningModule>): Promise<void> {
  const sets: string[] = []
  const args: any[] = []
  if (patch.order !== undefined) { sets.push('order_num = ?'); args.push(patch.order) }
  if (patch.title !== undefined) { sets.push('title = ?'); args.push(patch.title) }
  if (patch.description !== undefined) { sets.push('description = ?'); args.push(patch.description) }
  if (patch.color !== undefined) { sets.push('color = ?'); args.push(patch.color) }
  if (patch.progress !== undefined) { sets.push('progress = ?'); args.push(patch.progress) }
  if (patch.questionCount !== undefined) { sets.push('question_count = ?'); args.push(patch.questionCount) }
  if (sets.length === 0) return
  sets.push('updated_at = ?')
  args.push(new Date().toISOString())
  args.push(id)
  await executeRun(`UPDATE modules SET ${sets.join(', ')} WHERE id = ?`, args)
}

export async function deleteModule(id: string): Promise<void> {
  await executeRun('DELETE FROM modules WHERE id = ?', [id])
}

export async function replaceModules(list: LearningModule[]): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction(list.map(m => ({
    sql: `INSERT OR REPLACE INTO modules (id, order_num, title, description, color, progress, question_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [m.id, m.order, m.title, m.description, m.color, m.progress, m.questionCount, now, now]
  })))
}