'use client'

import Link from 'next/link'
import { ChevronRight, Clock3, FileText } from 'lucide-react'
import { ModuleIcon } from '@/components/student/module-icon'
import { moduleMeta } from '@/lib/mock-data'
import { useModules } from '@/lib/module-store'
import { estimateReadingMinutes } from '@/lib/pdf-extract'

export default function LearningPage() {
  const { modules } = useModules()

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Learning</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          Read each module like an article.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((mod) => {
          const meta = moduleMeta[mod.color]
          return (
            <article key={mod.id} className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
              <div className="flex items-start justify-between">
                <ModuleIcon moduleId={mod.id} color={mod.color} />
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">Module {mod.order}</p>
              <h2 className="text-base font-bold tracking-tight">{mod.title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{mod.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                {mod.content ? (
                  <>
                    <FileText className="size-3.5" /> {mod.content.pages} pages · {estimateReadingMinutes(mod.content.words)} min read
                  </>
                ) : (
                  <>
                    <Clock3 className="size-3.5" /> {mod.lessons.length} lessons
                  </>
                )}
              </p>
              <Link
                href={`/learning/${mod.id}`}
                className={`mt-4 flex h-9 items-center justify-center rounded-lg border bg-card text-sm font-semibold transition-colors hover:bg-muted/50 ${meta.border} ${meta.text}`}
              >
                Start Learning
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}