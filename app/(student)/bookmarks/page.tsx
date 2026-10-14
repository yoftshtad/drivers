'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkX, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleBookmark, useBookmarks } from '@/lib/bookmarks'
import { questionBank } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function BookmarksPage() {
  const bookmarks = useBookmarks()
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (open && !bookmarks.includes(open)) setOpen(null)
  }, [bookmarks, open])

  const saved = bookmarks.map((id) => questionBank.find((q) => q.id === id)).filter(Boolean)

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Bookmarks</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">Questions you saved while practicing. Revisit them until they stick.</p>
      </header>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <Bookmark className="size-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-bold">No bookmarks yet</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">
            Tap the bookmark icon on any question while practicing and it will appear here.
          </p>
          <Button className="mt-5 h-10 px-5 text-sm" render={<Link href="/practice" />} nativeButton={false}>
            Start practicing
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {saved.map((q) => {
            if (!q) return null
            const expanded = open === q.id
            return (
              <article key={q.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
                <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpen(expanded ? null : q.id)} aria-expanded={expanded}>
                  <p className="text-sm leading-6 font-bold">{q.text}</p>
                  <ChevronDown className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                </button>
                {expanded && (
                  <div className="mt-3 flex flex-col gap-1.5 text-sm">
                    {q.options.map((option, i) => (
                      <p key={i} className={cn('rounded-lg px-3 py-2', q.correct.includes(i) ? 'bg-green-50 font-semibold text-green-800' : 'text-muted-foreground')}>
                        {String.fromCharCode(65 + i)}. {option}
                      </p>
                    ))}
                    <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6 text-muted-foreground">
                      <span className="font-bold text-foreground">Explanation: </span>
                      {q.explanation}
                    </p>
                    <button
                      className="mt-1 flex w-fit items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                      onClick={() => toggleBookmark(q.id)}
                    >
                      <BookmarkX className="size-3.5" /> Remove bookmark
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
