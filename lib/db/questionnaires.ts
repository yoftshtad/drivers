import { db, execute, executeOne, executeRun } from './index'
import type { Questionnaire } from '@/lib/types'

function rowToQuestionnaire(row: any): Questionnaire {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    questionCount: row.question_count,
    timeLimitMin: row.time_limit_min,
    passMark: row.pass_mark,
    mode: row.mode,
  }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  const rows = await execute<any>('SELECT * FROM questionnaires ORDER BY module_id, title')
  return rows.map(rowToQuestionnaire)
}

export async function getQuestionnaire(id: string): Promise<Questionnaire | undefined> {
  const row = await executeOne<any>('SELECT * FROM questionnaires WHERE id = ?', [id])
  return row ? rowToQuestionnaire(row) : undefined
}

export async function createQuestionnaire(input: Omit<Questionnaire, 'id'>): Promise<Questionnaire> {
  const id = `qnr-${Date.now().toString(36)}`
  const now = new Date().toISOString()
  await executeRun(
    `INSERT INTO questionnaires (id, module_id, title, description, question_count, time_limit_min, pass_mark, mode, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.moduleId, input.title, input.description, input.questionCount, input.timeLimitMin, input.passMark, input.mode, now, now]
  )
  return { ...input, id }
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  await executeRun('DELETE FROM questionnaires WHERE id = ?', [id])
}

export async function deleteQuestionnairesForModule(moduleId: string): Promise<void> {
  await executeRun('DELETE FROM questionnaires WHERE module_id = ?', [moduleId])
}