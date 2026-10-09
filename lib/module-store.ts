'use client'

import { useEffect, useState } from 'react'
import type { LearningModule, ModuleColor, ModuleContent } from './types'
import { modules as seedModules } from './mock-data'

const seed = seedModules

async function fetchModules(): Promise<LearningModule[]> {
  const res = await fetch('/api/admin/modules', { cache: 'no-store' })
  if (!res.ok) return seed
  const data = await res.json()
  return data.modules ?? seed
}

export async function getModules(): Promise<LearningModule[]> {
  if (typeof window === 'undefined') return seed
  return fetchModules()
}

export async function getModule(id: string): Promise<LearningModule | undefined> {
  const modules = await getModules()
  return modules.find(m => m.id === id)
}

export async function createModule(input: { title: string; description: string; color: ModuleColor; order: number }): Promise<LearningModule> {
  const res = await fetch('/api/admin/modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create module')
  const data = await res.json()
  return data.module
}

export async function updateModule(id: string, patch: Partial<LearningModule>): Promise<void> {
  const res = await fetch(`/api/admin/modules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update module')
}

export async function deleteModule(id: string): Promise<void> {
  const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete module')
}

export async function replaceModules(list: LearningModule[]): Promise<void> {
  const res = await fetch('/api/admin/modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
  if (!res.ok) throw new Error('Failed to replace modules')
}

export function subscribeModules(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.modules-change', listener)
  return () => window.removeEventListener('dp.modules-change', listener)
}

export { type LearningModule, type ModuleContent }
export function useModules(): { modules: LearningModule[]; ready: boolean } {
  const [modules, setModules] = useState<LearningModule[]>(seed)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchModules()
      if (mounted) {
        setModules(data)
        setReady(true)
      }
    }
    load()
    const unsub = subscribeModules(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return { modules, ready }
}