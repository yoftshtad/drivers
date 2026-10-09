import { db, execute, executeOne, executeRun } from './index'
import type { AttemptRecord } from '@/lib/types'

function rowToAttempt(row: any): AttemptRecord {
  return {
    id: row.id,
    questionnaireTitle: row.questionnaire_title,
    mode: row.mode,
    score: row.score,
    total: row.total,
    percent: row.percent,
    passed: Boolean(row.passed),
    completedAt: row.completed_at,
    weakCategories: JSON.parse(row.weak_categories || '[]'),
  }
}

export async function getAttempts(): Promise<AttemptRecord[]> {
  try {
    const rows = await execute<any>('SELECT * FROM attempts ORDER BY completed_at DESC')
    return rows.map(rowToAttempt)
  } catch {
    return []
  }
}

export async function saveAttempt(record: AttemptRecord): Promise<void> {
  try {
    await executeRun(
      `INSERT INTO attempts (id, user_id, questionnaire_title, mode, score, total, percent, passed, completed_at, weak_categories, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [record.id, `user-${record.questionnaireTitle}`, record.questionnaireTitle, record.mode, record.score, record.total, record.percent, record.passed ? 1 : 0, record.completedAt, JSON.stringify(record.weakCategories), new Date().toISOString(), new Date().toISOString()]
    )
    await executeRun('DELETE FROM attempts WHERE id NOT IN (SELECT id FROM attempts ORDER BY completed_at DESC LIMIT 30)')
  } catch {
    // table might not exist
  }
}

export interface LastAttempt {
  title: string
  mode: 'practice' | 'mock'
  score: number
  total: number
  percent: number
  passed: boolean
  passMark: number
  timeSpentSec: number
  completedAt: string
  answers: { questionId: string; selected: number[]; correct: boolean }[]
}

export async function setLastAttempt(attempt: LastAttempt): Promise<void> {
  try {
    await executeRun(
      `INSERT INTO last_attempt (id, data) VALUES ('last', ?) ON CONFLICT(id) DO UPDATE SET data = ?`,
      [JSON.stringify(attempt), JSON.stringify(attempt)]
    )
  } catch {
    // table might not exist
  }
}

export async function getLastAttempt(): Promise<LastAttempt | null> {
  try {
    const row = await executeOne<any>('SELECT data FROM last_attempt WHERE id = ?', ['last'])
    return row ? JSON.parse(row.data) : null
  } catch {
    return null
  }
}