'use client'

import { useEffect, useState } from 'react'
import type { AttemptRecord } from './types'

async function fetchAttempts(last = false): Promise<AttemptRecord[] | AttemptRecord | null> {
  const url = last ? '/api/student/attempts?last=true' : '/api/student/attempts'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return last ? null : []
  const data = await res.json()
  return last ? data.attempt : data.attempts
}

export async function getAttempts(): Promise<AttemptRecord[]> {
  if (typeof window === 'undefined') return []
  return fetchAttempts() as Promise<AttemptRecord[]>
}

export async function saveAttempt(record: AttemptRecord): Promise<void> {
  const res = await fetch('/api/student/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attempt: record }),
  })
  if (!res.ok) throw new Error('Failed to save attempt')
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
  const res = await fetch('/api/student/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lastAttempt: attempt }),
  })
  if (!res.ok) throw new Error('Failed to save last attempt')
}

export async function getLastAttempt(): Promise<LastAttempt | null> {
  if (typeof window === 'undefined') return null
  return fetchAttempts(true) as Promise<LastAttempt | null>
}

export function subscribeAttempts(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.attempts-change', listener)
  return () => window.removeEventListener('dp.attempts-change', listener)
}

export function useAttempts(): AttemptRecord[] {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchAttempts()
      if (mounted) {
        setAttempts(data as AttemptRecord[])
        setLoading(false)
      }
    }
    load()
    const unsub = subscribeAttempts(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return attempts
}