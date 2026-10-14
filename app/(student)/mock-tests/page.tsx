'use client'

import Link from 'next/link'
import { ChevronRight, ListChecks, Target } from 'lucide-react'
import { ModuleIcon } from '@/components/student/module-icon'
import { useModules } from '@/lib/module-store'
import { useQuestionnaires } from '@/lib/questionnaire-store'

export default function MockTestsPage() {
  const mockTests = useQuestionnaires().filter((q) => q.mode === 'mock')
  const { modules } = useModules()

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mock Tests</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          Simulate real exam conditions: randomized questions, a countdown timer, and results only after submission.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        {mockTests.map((test) => {
          const mod = modules.find((m) => m.id === test.moduleId)
          return (
            <article key={test.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)] sm:p-6">
              <ModuleIcon moduleId={test.moduleId} color={mod?.color ?? 'purple'} className="size-14" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold tracking-tight">{test.title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{test.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="size-3.5" /> {test.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="size-3.5" /> Pass mark {test.passMark}%
                  </span>
                </div>
              </div>
              <Link
                href={`/mock-tests/${test.id}`}
                className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start test <ChevronRight className="size-4" />
              </Link>
            </article>
          )
        })}
        {mockTests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-base font-bold">No mock tests yet</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
              Mock tests will appear here once your instructor publishes them.
            </p>
          </div>
        )}
      </div>

      <section className="mt-8 rounded-2xl bg-muted/60 p-6">
        <h2 className="text-base font-extrabold">Mock test rules</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
          <li>• Questions and options are randomized on every attempt.</li>
          <li>• Correctness feedback is delayed until you submit the full test.</li>
          <li>• No time limit — take as long as you need.</li>
          <li>• You can navigate between questions and change answers before submitting.</li>
        </ul>
      </section>
    </div>
  )
}
