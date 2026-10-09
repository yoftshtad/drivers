'use client'

import { useEffect, useState } from 'react'
import type { Question } from './types'
import { questionBank as seedQuestions } from './mock-data'

export { type Question }

async function fetchQuestions(moduleId?: string): Promise<Question[]> {
  const url = moduleId ? `/api/admin/questions?moduleId=${moduleId}` : '/api/admin/questions'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return seedQuestions
  const data = await res.json()
  return data.questions ?? seedQuestions
}

export async function getQuestions(): Promise<Question[]> {
  if (typeof window === 'undefined') return seedQuestions
  return fetchQuestions()
}

export async function getQuestionsFor(moduleId: string): Promise<Question[]> {
  if (typeof window === 'undefined') return seedQuestions.filter(q => q.moduleId === moduleId)
  return fetchQuestions(moduleId)
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  const questions = await getQuestions()
  return questions.find(q => q.id === id)
}

export async function createQuestion(input: Omit<Question, 'id'>): Promise<Question> {
  const res = await fetch('/api/admin/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create question')
  const data = await res.json()
  return data.question
}

export async function updateQuestion(id: string, patch: Partial<Question>): Promise<void> {
  const res = await fetch(`/api/admin/questions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update question')
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete question')
}

export async function deleteQuestionsForModule(moduleId: string): Promise<void> {
  const res = await fetch(`/api/admin/questions?moduleId=${moduleId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete questions for module')
}

export function subscribeQuestions(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.questions-change', listener)
  return () => window.removeEventListener('dp.questions-change', listener)
}

export function useQuestions(): Question[] {
  const [items, setItems] = useState<Question[]>(seedQuestions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchQuestions()
      if (mounted) {
        setItems(data)
        setLoading(false)
      }
    }
    load()
    const unsub = subscribeQuestions(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return items
}