'use client'

import { useEffect, useState } from 'react'
import type { Questionnaire } from './types'
import { mockTests, questionnaires as seedQuestionnaires } from './mock-data'

export { type Questionnaire }

function seed(): Questionnaire[] {
  return [...seedQuestionnaires, ...mockTests]
}

async function fetchQuestionnaires(): Promise<Questionnaire[]> {
  const res = await fetch('/api/admin/questionnaires', { cache: 'no-store' })
  if (!res.ok) return seed()
  const data = await res.json()
  return data.questionnaires ?? seed()
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  if (typeof window === 'undefined') return seed()
  return fetchQuestionnaires()
}

export async function getQuestionnaire(id: string): Promise<Questionnaire | undefined> {
  const questionnaires = await getQuestionnaires()
  return questionnaires.find(q => q.id === id)
}

export async function createQuestionnaire(input: Omit<Questionnaire, 'id'>): Promise<Questionnaire> {
  const res = await fetch('/api/admin/questionnaires', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create questionnaire')
  const data = await res.json()
  return data.questionnaire
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  const res = await fetch(`/api/admin/questionnaires/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete questionnaire')
}

export async function deleteQuestionnairesForModule(moduleId: string): Promise<void> {
  const res = await fetch(`/api/admin/questionnaires?moduleId=${moduleId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete questionnaires for module')
}

export function subscribeQuestionnaires(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.questionnaires-change', listener)
  return () => window.removeEventListener('dp.questionnaires-change', listener)
}

export function useQuestionnaires(): Questionnaire[] {
  const [items, setItems] = useState<Questionnaire[]>(seed)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchQuestionnaires()
      if (mounted) {
        setItems(data)
        setLoading(false)
      }
    }
    load()
    const unsub = subscribeQuestionnaires(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return items
}