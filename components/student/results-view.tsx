'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLastAttempt, type LastAttempt } from '@/lib/attempt-store'
import { useQuestions } from '@/lib/question-store'
import { cn } from '@/lib/utils'

export function ResultsView({ retakePath, listPath, listLabel = 'Back' }: { retakePath: string; listPath: string; listLabel?: string }) {
  const [attempt, setAttempt] = useState<LastAttempt | null>(null)
  const [loaded, setLoaded] = useState(false)
  const allQuestions = useQuestions()

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        const lastAttempt = await getLastAttempt()
        console.log('ResultsView - loaded attempt:', lastAttempt)
        setAttempt(lastAttempt)
      } catch (e) {
        console.error('ResultsView - error loading attempt:', e)
        setAttempt(null)
      } finally {
        setLoaded(true)
      }
    }
    loadAttempt()
  }, [])

  if (!loaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-label="Loading" />
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-xl font-bold">No results yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Complete a questionnaire or mock test to see your results here.</p>
        <Button className="mt-6 h-11 px-5 text-sm" render={<Link href={listPath} />} nativeButton={false}>
          {listLabel}
        </Button>
      </div>
    )
  }

  // Ensure all required fields have valid defaults
  const score = attempt.score ?? 0
  const total = attempt.total ?? 0
  const percent = attempt.percent ?? 0
  const passed = attempt.passed ?? false
  const passMark = attempt.passMark ?? 0
  const title = attempt.title ?? 'Test'
  
  const answers = attempt.answers ?? []
  const wrong = answers.filter((a) => !a.correct)
  const answeredCount = answers.length

  return (
    <div className="mx-auto max-w-3xl">
      <header className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[0_1px_3px_rgb(16_24_40/0.05)] sm:p-8">
        <span className={cn('mx-auto flex size-16 items-center justify-center rounded-full', passed ? 'bg-green-100' : 'bg-red-100')}>
          {passed ? <CircleCheck className="size-8 text-green-600" /> : <CircleX className="size-8 text-red-600" />}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{passed ? 'Congratulations — you passed!' : 'Not passed this time'}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{title}</p>

        <div className="mx-auto mt-6 flex max-w-lg items-center gap-5">
          <div className="relative flex size-28 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(percent / 100) * 264} 264`}
                className={passed ? 'text-green-600' : 'text-red-500'}
              />
            </svg>
            <span className="absolute text-xl font-extrabold">{percent}%</span>
          </div>
          <dl className="grid flex-1 grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Score</dt>
              <dd className="mt-0.5 text-lg font-extrabold">
                {score}/{total}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Percentile</dt>
              <dd className="mt-0.5 text-lg font-extrabold">{percent}%</dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Questions answered</dt>
              <dd className="mt-0.5 text-lg font-extrabold">{answeredCount}/{total}</dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Mistakes</dt>
              <dd className="mt-0.5 text-lg font-extrabold text-red-600">{wrong.length}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button className="h-11 px-5 text-sm" render={<Link href={retakePath} />} nativeButton={false}>
            <RotateCcw className="size-4" /> Retake
          </Button>
          <Button variant="outline" className="h-11 px-5 text-sm" render={<Link href={listPath} />} nativeButton={false}>
            {listLabel}
          </Button>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-extrabold tracking-tight">Review your answers</h2>
        <div className="mt-3 flex flex-col gap-3">
          {answers.map((answer, i) => {
            const question = allQuestions.find((q) => q.id === answer.questionId)
            if (!question) return null
            return (
              <article key={answer.questionId} className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-6 font-bold">
                    {i + 1}. {question.text}
                  </p>
                  {answer.correct ? <CircleCheck className="size-5 shrink-0 text-green-600" /> : <CircleX className="size-5 shrink-0 text-red-500" />}
                </div>
                <div className="mt-3 flex flex-col gap-1.5 text-sm">
                  {question.options.map((option, oi) => {
                    const chosen = answer.selected.includes(oi)
                    const isCorrectOption = question.correct.includes(oi)
                    return (
                      <p
                        key={oi}
                        className={cn(
                          'rounded-lg px-3 py-2 flex items-center gap-2',
                          chosen && isCorrectOption && 'bg-green-50 text-green-800 font-semibold',
                          chosen && !isCorrectOption && 'bg-red-50 text-red-700 font-semibold',
                          !chosen && isCorrectOption && 'bg-green-50 text-green-800',
                          !chosen && !isCorrectOption && 'text-muted-foreground',
                        )}
                      >
                        <span className="flex size-6 items-center justify-center rounded-full border text-xs font-bold flex-shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{option}</span>
                        {chosen && isCorrectOption && <CircleCheck className="size-4 text-green-600" />}
                        {chosen && !isCorrectOption && <CircleX className="size-4 text-red-600" />}
                        {!chosen && isCorrectOption && <CircleCheck className="size-4 text-green-600" />}
                      </p>
                    )
                  })}
                </div>
                {!answer.correct && (
                  <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6 text-muted-foreground">
                    <span className="font-bold text-foreground">Explanation: </span>
                    {question.explanation}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}