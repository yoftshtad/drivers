'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ModuleColor } from '@/lib/types'

export interface ModuleFormValues {
  title: string
  description: string
  color: ModuleColor
  order: number
}

export function ModuleForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ModuleFormValues
  submitLabel: string
  onSubmit: (values: ModuleFormValues) => Promise<void | string> | void | string
}) {
  const router = useRouter()
  const [values, setValues] = useState<ModuleFormValues>(initial ?? { title: '', description: '', color: 'blue', order: 5 })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof ModuleFormValues>(key: K, value: ModuleFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (values.title.trim().length < 3) return setError('Title must be at least 3 characters.')
    if (values.description.trim().length < 10) return setError('Description must be at least 10 characters.')
    setError(null)
    setSubmitting(true)
    try {
      const target = await onSubmit(values)
      router.push(typeof target === 'string' ? target : '/admin/modules')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Module title</Label>
        <Input id="title" placeholder="e.g. Traffic Signs" value={values.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="What students will learn in this module…" value={values.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Theme color</Label>
          <Select id="color" value={values.color} onChange={(e) => set('color', e.target.value as ModuleColor)}>
            <option value="blue">Blue</option>
            <option value="orange">Orange</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="order">Display order</Label>
          <Input id="order" type="number" min={1} value={values.order} onChange={(e) => set('order', Number(e.target.value))} />
        </div>
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">{error}</p>}
      <div className="flex gap-2.5">
        <Button type="submit" disabled={submitting} className="h-10 px-5 text-sm">
          {submitting ? 'Creating…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" disabled={submitting} className="h-10 px-5 text-sm" onClick={() => router.push('/admin/modules')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
