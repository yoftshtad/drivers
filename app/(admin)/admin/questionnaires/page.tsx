'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Trash2, FileSpreadsheet } from 'lucide-react'
import { ModuleIcon } from '@/components/student/module-icon'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useModules } from '@/lib/module-store'
import { deleteQuestionnaire, useQuestionnaires, type Questionnaire } from '@/lib/questionnaire-store'

export default function AdminQuestionnairesPage() {
  const questionnaires = useQuestionnaires()
  const { modules } = useModules()
  const [pendingDelete, setPendingDelete] = useState<Questionnaire | null>(null)
  const [deletedTitle, setDeletedTitle] = useState<string | null>(null)

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteQuestionnaire(pendingDelete.id)
    setDeletedTitle(pendingDelete.title)
    setPendingDelete(null)
    setTimeout(() => setDeletedTitle(null), 4000)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Questionnaires</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            {questionnaires.length} questionnaires. Configure count, time limit, pass mark and mode — students can enter any of them directly.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/questionnaires/import" className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted">
            <FileSpreadsheet className="size-4" /> Import from Excel
          </Link>
          <Link href="/admin/questionnaires/new" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="size-4" /> New questionnaire
          </Link>
        </div>
      </header>

      {deletedTitle && (
        <p className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-700 ring-1 ring-green-100">
          Questionnaire “{deletedTitle}” has been deleted.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {questionnaires.map((q) => {
          const mod = modules.find((m) => m.id === q.moduleId)
          return (
            <article key={q.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
              <ModuleIcon moduleId={q.moduleId} color={mod?.color ?? 'purple'} className="size-12" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold">{q.title}</h2>
                  <Badge variant={q.mode === 'practice' ? 'info' : 'warning'} className="capitalize">
                    {q.mode}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{q.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{q.questionCount} questions</Badge>
                <Badge variant="secondary">Pass {q.passMark}%</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPendingDelete(q)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                  aria-label={`Delete questionnaire ${q.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </article>
          )
        })}
        {questionnaires.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-base font-bold">No questionnaires</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
              Create your first questionnaire. Students will see it immediately under Questionnaire or Mock Tests.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        message="Students will immediately lose access to this questionnaire. This cannot be undone."
        confirmLabel="Delete questionnaire"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
