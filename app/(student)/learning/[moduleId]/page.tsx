'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ChevronRight, Circle, Clock3, Film, FileText, PlayCircle } from 'lucide-react'
import { ModuleIcon } from '@/components/student/module-icon'
import { ReadingView } from '@/components/student/reading-view'
import { Badge } from '@/components/ui/badge'
import { moduleMeta } from '@/lib/mock-data'
import { useModules } from '@/lib/module-store'
import { useQuestions } from '@/lib/question-store'
import { cn } from '@/lib/utils'

export default function ModuleDetailPage() {
  const params = useParams<{ moduleId: string }>()
  const { modules } = useModules()
  const questions = useQuestions()

  const mod = modules.find((m) => m.id === params.moduleId)

  if (!mod) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-xl font-bold">Module not found</h1>
        <Link href="/learning" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
          Back to learning
        </Link>
      </div>
    )
  }

  if (mod.content) {
    const sorted = [...modules].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((m) => m.id === mod.id)
    return <ReadingView module={mod} nextModule={sorted[idx + 1]} />
  }

  const meta = moduleMeta[mod.color]
  const done = mod.lessons.filter((l) => l.completed).length
  const nextLesson = mod.lessons.find((l) => !l.completed) ?? mod.lessons[0]
  const questionCount = questions.filter((q) => q.moduleId === mod.id).length

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/learning" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All modules
      </Link>

      <header className="mt-4 flex flex-wrap items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <ModuleIcon moduleId={mod.id} color={mod.color} className="size-20" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Module {mod.order}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{mod.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
        </div>
        {nextLesson && (
          <div className="flex flex-col gap-2">
            <Link
              href={`/learning/${mod.id}/${nextLesson.id}`}
              className={cn('flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90', meta.solid)}
            >
              <PlayCircle className="size-4" /> {done === 0 ? 'Start learning' : 'Continue learning'}
            </Link>
            {questionCount > 0 && (
              <Link
                href={`/questionnaires/${mod.id}`}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Practice {questionCount} questions <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        )}
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-extrabold tracking-tight">Lessons</h2>
        {mod.lessons.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="text-base font-bold">No content yet</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">
              The reading material for this module hasn&apos;t been published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
            {mod.lessons.map((lesson, i) => (
              <Link
                key={lesson.id}
                href={`/learning/${mod.id}/${lesson.id}`}
                className={cn('flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50', i > 0 && 'border-t border-border/70')}
              >
                {lesson.completed ? (
                  <CheckCircle2 className="size-5.5 shrink-0 text-green-600" />
                ) : (
                  <Circle className="size-5.5 shrink-0 text-border" />
                )}
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', lesson.type === 'video' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600')}>
                  {lesson.type === 'video' ? <Film className="size-5" /> : <FileText className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{lesson.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{lesson.summary}</span>
                </span>
                <Badge variant="secondary" className="hidden gap-1 sm:inline-flex">
                  <Clock3 className="size-3" /> {lesson.duration}
                </Badge>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}