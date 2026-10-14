'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createQuestionnaire } from '@/lib/questionnaire-store'
import { useModules } from '@/lib/module-store'

export default function NewQuestionnairePage() {
  const router = useRouter()
  const { modules } = useModules()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [moduleId, setModuleId] = useState('random')
  const [mode, setMode] = useState<'practice' | 'mock'>('practice')
  const [questionCount, setQuestionCount] = useState(20)
  const [passMark, setPassMark] = useState(70)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.')
    if (questionCount < 1 || questionCount > 200) return setError('Question count must be between 1 and 200.')
    if (passMark < 1 || passMark > 100) return setError('Pass mark must be between 1 and 100.')
    setError(null)
    createQuestionnaire({ title: title.trim(), description: description.trim(), moduleId, mode, questionCount, passMark })
    router.push('/admin/questionnaires')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">New questionnaire</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Set the selection rules. Students can enter questionnaires directly — no learning-first sequence required.</p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Road Rules" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="module">Question source</Label>
            <Select id="module" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              <option value="random">Random — all modules</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="What this questionnaire covers…" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mode">Mode</Label>
            <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value as 'practice' | 'mock')}>
              <option value="practice">Practice — instant feedback</option>
              <option value="mock">Mock — delayed feedback</option>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="count">Question count</Label>
            <Input id="count" type="number" min={1} max={200} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pass">Pass mark (%)</Label>
            <Input id="pass" type="number" min={1} max={100} value={passMark} onChange={(e) => setPassMark(Number(e.target.value))} />
          </div>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {mode === 'mock' ? (
            <>
              <X className="size-4 shrink-0 text-amber-500" /> Mock mode randomizes questions and options, hides correctness feedback until
              submission.
            </>
          ) : (
            <>
              <Plus className="size-4 shrink-0 text-green-600" /> Practice mode grades each answer immediately and shows the explanation.
            </>
          )}
        </p>
        {error && <p className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">{error}</p>}
        <div className="flex gap-2.5">
          <Button type="submit" className="h-10 px-5 text-sm">
            Create questionnaire
          </Button>
          <Button type="button" variant="outline" className="h-10 px-5 text-sm" onClick={() => router.push('/admin/questionnaires')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
