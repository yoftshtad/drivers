'use client'

import { useEffect, useState } from 'react'

export interface ReadingProgress {
  percent: number
  completed: boolean
  lastReadAt: string
}

const seedProgress: Record<string, ReadingProgress> = {
  'traffic-signs': { percent: 0, completed: false, lastReadAt: '' },
  'road-rules': { percent: 0, completed: false, lastReadAt: '' },
  'defensive-driving': { percent: 0, completed: false, lastReadAt: '' },
  'vehicle-knowledge': { percent: 0, completed: false, lastReadAt: '' },
}

async function fetchProgress(moduleId?: string): Promise<Record<string, ReadingProgress> | ReadingProgress | undefined> {
  const url = moduleId ? `/api/student/progress?moduleId=${moduleId}` : '/api/student/progress'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return moduleId ? undefined : seedProgress
  const data = await res.json()
  return moduleId ? data.progress : data.progress
}

export async function getProgressMap(): Promise<Record<string, ReadingProgress>> {
  if (typeof window === 'undefined') return seedProgress
  const data = await fetchProgress()
  return data as Record<string, ReadingProgress> ?? seedProgress
}

export async function getModuleProgress(moduleId: string): Promise<ReadingProgress | undefined> {
  if (typeof window === 'undefined') return seedProgress[moduleId]
  const data = await fetchProgress(moduleId)
  return data as ReadingProgress | undefined
}

export async function saveReadingProgress(moduleId: string, percent: number, completed = false): Promise<void> {
  const res = await fetch('/api/student/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId, percent, completed }),
  })
  if (!res.ok) throw new Error('Failed to save progress')
}

export async function deleteModuleProgress(moduleId: string): Promise<void> {
  const res = await fetch(`/api/student/progress?moduleId=${moduleId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete progress')
}

export function subscribeProgress(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.progress-change', listener)
  return () => window.removeEventListener('dp.progress-change', listener)
}

export function useProgressMap(): Record<string, ReadingProgress> {
  const [map, setMap] = useState<Record<string, ReadingProgress>>(seedProgress)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchProgress()
      if (mounted) {
        setMap(data as Record<string, ReadingProgress> ?? seedProgress)
        setLoading(false)
      }
    }
    load()
    const unsub = subscribeProgress(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return map
}