import type { Question } from './types'

/** Server-authoritative grading logic (PDF Phase 16). In the MVP mock these run client-side,
 *  but they are kept isolated here so they can move to a server action unchanged. */
export function gradeAnswer(question: Question, selected: number[]): boolean {
  // Ensure correct is an array (parse if it's a JSON string)
  const correct = typeof question.correct === 'string' ? JSON.parse(question.correct) : question.correct
  if (selected.length !== correct.length) return false
  const a = [...selected].sort().join(',')
  const b = [...correct].sort().join(',')
  return a === b
}

export function calculateScore(grades: boolean[]): number {
  return grades.filter(Boolean).length
}

export function calculateResult(score: number, total: number, passMark: number): { percent: number; passed: boolean } {
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)
  return { percent, passed: percent >= passMark }
}

export function isPassing(percent: number, passMark: number): boolean {
  return percent >= passMark
}

export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
