import { db, execute, executeOne, executeRun } from './index'
import type { LearningModule, ModuleColor, ModuleContent } from '@/lib/types'

function rowToModule(row: any): LearningModule {
  return {
    id: row.id,
    order: row.order,
    title: row.title,
    description: row.description,
    color: row.color,
    progress: row.progress,
    questionCount: row.question_count,
    lessons: JSON.parse(row.lessons || '[]'),
    content: row.content ? JSON.parse(row.content) : undefined,
  }
}

export async function getModules(): Promise<LearningModule[]> {
  const rows = await execute<any>('SELECT * FROM modules ORDER BY `order`')
  return rows.map(rowToModule)
}

export async function getModule(id: string): Promise<LearningModule | undefined> {
  const row = await executeOne<any>('SELECT * FROM modules WHERE id = ?', [id])
  return row ? rowToModule(row) : undefined
}

export async function createModule(input: { title: string; description: string; color: ModuleColor; order: number }): Promise<LearningModule> {
  const id = `mod-${Date.now().toString(36)}`
  await executeRun(
    `INSERT INTO modules (id, \`order\`, title, description, color, progress, question_count, lessons, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.order, input.title, input.description, input.color, 0, 0, '[]', null]
  )
  return { ...input, id, progress: 0, questionCount: 0, lessons: [] }
}

export async function updateModule(id: string, patch: Partial<LearningModule>): Promise<void> {
  const sets: string[] = []
  const args: any[] = []
  if (patch.order !== undefined) { sets.push('`order` = ?'); args.push(patch.order) }
  if (patch.title !== undefined) { sets.push('title = ?'); args.push(patch.title) }
  if (patch.description !== undefined) { sets.push('description = ?'); args.push(patch.description) }
  if (patch.color !== undefined) { sets.push('color = ?'); args.push(patch.color) }
  if (patch.progress !== undefined) { sets.push('progress = ?'); args.push(patch.progress) }
  if (patch.questionCount !== undefined) { sets.push('question_count = ?'); args.push(patch.questionCount) }
  if (patch.lessons !== undefined) { sets.push('lessons = ?'); args.push(JSON.stringify(patch.lessons)) }
  if (patch.content !== undefined) { sets.push('content = ?'); args.push(patch.content ? JSON.stringify(patch.content) : null) }
  if (sets.length === 0) return
  args.push(id)
  await executeRun(`UPDATE modules SET ${sets.join(', ')} WHERE id = ?`, args)
}

export async function deleteModule(id: string): Promise<void> {
  await executeRun('DELETE FROM modules WHERE id = ?', [id])
}

export async function replaceModules(list: LearningModule[]): Promise<void> {
  await db.transaction(list.map(m => ({
    sql: `INSERT OR REPLACE INTO modules (id, \`order\`, title, description, color, progress, question_count, lessons, content)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [m.id, m.order, m.title, m.description, m.color, m.progress, m.questionCount, JSON.stringify(m.lessons), m.content ? JSON.stringify(m.content) : null]
  })))
}