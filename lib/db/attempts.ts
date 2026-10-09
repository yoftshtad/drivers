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
  const rows = await execute<any>('SELECT * FROM attempts ORDER BY completed_at DESC')
  return rows.map(rowToAttempt)
}

export async function saveAttempt(record: AttemptRecord): Promise<void> {
  await executeRun(
    `INSERT INTO attempts (id, questionnaire_title, mode, score, total, percent, passed, completed_at, weak_categories)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [record.id, record.questionnaireTitle, record.mode, record.score, record.total, record.percent, record.passed ? 1 : 0, record.completedAt, JSON.stringify(record.weakCategories)]
  )
  await executeRun('DELETE FROM attempts WHERE id NOT IN (SELECT id FROM attempts ORDER BY completed_at DESC LIMIT 30)')
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
  await executeRun(
    `INSERT INTO last_attempt (id, data) VALUES ('last', ?) ON CONFLICT(id) DO UPDATE SET data = ?`,
    [JSON.stringify(attempt), JSON.stringify(attempt)]
  )
}

export async function getLastAttempt(): Promise<LastAttempt | null> {
  const row = await executeOne<any>('SELECT data FROM last_attempt WHERE id = ?', ['last'])
  return row ? JSON.parse(row.data) : null
}