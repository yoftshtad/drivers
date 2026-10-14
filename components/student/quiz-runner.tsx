'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bookmark, CircleCheck, CircleX, Flag, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { gradeAnswer, calculateScore, calculateResult, formatTime } from '@/lib/grading'
import { saveAttempt, setLastAttempt } from '@/lib/attempt-store'
import { toggleBookmark, useBookmarks } from '@/lib/bookmarks'
import { getQuizSession } from '@/lib/quiz-session'
import { moduleMeta } from '@/lib/mock-data'
import type { QuizSession } from '@/lib/quiz-session'
import { cn } from '@/lib/utils'

export function QuizRunner() {
  const router = useRouter()
  const bookmarks = useBookmarks()
  const [session, setSession] = useState<QuizSession | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [selected, setSelected] = useState<number[]>([])
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let retries = 0
    const loadSession = () => {
      const s = getQuizSession()
      if (!s || s.questions.length === 0) {
        if (retries < 10) {
          retries++
          setTimeout(loadSession, 100)
          return
        }
        router.replace('/')
        return
      }
      setSession(s)
      setSecondsLeft(s.timeLimitMin * 60)
      setLoaded(true)
    }
    loadSession()
  }, [router])

  const question = session?.questions[index]
  const total = session?.questions.length ?? 0
  const mode = session?.mode ?? 'practice'
  const answeredCount = Object.keys(answers).length
  const isLast = index === total - 1

  const finish = useCallback(() => {
    if (!session) return
    setSubmitting(true)
    const graded = session.questions.map((q) => ({
      questionId: q.id,
      selected: answers[q.id] ?? [],
      correct: gradeAnswer(q, answers[q.id] ?? []),
    }))
    const score = calculateScore(graded.map((g) => g.correct))
    const { percent, passed } = calculateResult(score, total, session.passMark)
    const completedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    setLastAttempt({
      title: session.title,
      mode: session.mode,
      score,
      total,
      percent,
      passed,
      passMark: session.passMark,
      timeSpentSec: session.mode === 'mock' ? session.timeLimitMin * 60 - secondsLeft : 0,
      completedAt,
      answers: graded,
    })
    saveAttempt({
      id: `a-${Date.now()}`,
      questionnaireTitle: session.title,
      mode: session.mode,
      score,
      total,
      percent,
      passed,
      completedAt,
      weakCategories: [...new Set(session.questions.filter((q, i) => !graded[i].correct).map((q) => moduleMeta[q.moduleId]?.label ?? q.moduleId))],
    })
    router.replace(session.resultsPath)
  }, [answers, router, secondsLeft, session, total])

  useEffect(() => {
    if (!session || session.mode !== 'mock' || session.timeLimitMin <= 0) return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [session])

  useEffect(() => {
    if (session && session.mode === 'mock' && session.timeLimitMin > 0 && secondsLeft === 0 && !submitting && loaded) finish()
  }, [secondsLeft, session, submitting, loaded, finish])

  if (!loaded || !session || !question) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-label="Loading" />
      </div>
    )
  }

  const select = (optionIndex: number) => {
    if (feedback) return
    setSelected((prev) => (prev.includes(optionIndex) ? prev.filter((i) => i !== optionIndex) : [...prev, optionIndex]))
  }

  const submitAnswer = () => {
    if (selected.length === 0) return
    const correct = gradeAnswer(question, selected)
    setAnswers((prev) => ({ ...prev, [question.id]: selected }))
    setFeedback({ correct })
  }

  const next = () => {
    // Save answer before moving (for mock mode) - also on last question before submit
    if (mode === 'mock' && selected.length > 0) {
      setAnswers((prev) => ({ ...prev, [question.id]: selected }))
    }
    if (isLast) {
      finish()
      return
    }
    const nextQ = session.questions[index + 1]
    setIndex((i) => i + 1)
    setSelected(answers[nextQ.id] ?? [])
    setFeedback(null)
  }

  const moveTo = (target: number) => {
    if (target === index || target < 0 || target >= total) return
    // Save answer before moving (for mock mode)
    if (mode === 'mock' && selected.length > 0) {
      setAnswers((prev) => ({ ...prev, [question.id]: selected }))
    }
    setIndex(target)
    setSelected(answers[session.questions[target].id] ?? [])
    setFeedback(null)
    setConfirmSubmit(false)
  }

  const bookmarked = bookmarks.includes(question.id)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">{session.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Question {index + 1} of {total} · {mode === 'practice' ? 'Practice mode — instant feedback' : 'Mock mode — feedback after submission'}
          </p>
        </div>
        {mode === 'mock' && session && session.timeLimitMin > 0 && (
          <Badge variant={secondsLeft < 60 ? 'destructive' : 'secondary'} className="gap-1.5 px-3 py-1.5 text-sm">
            <Timer className="size-4" /> {formatTime(secondsLeft)}
          </Badge>
        )}
      </div>

      <Progress value={((index + 1) / total) * 100} className="mt-4" />

      {mode === 'mock' && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {session.questions.map((q, i) => {
            const answered = !!answers[q.id]
            return (
              <button
                key={q.id}
                onClick={() => moveTo(i)}
                aria-label={`Go to question ${i + 1}`}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                  i === index ? 'bg-primary text-primary-foreground' : answered ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground hover:bg-muted/70',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}

      <article className="mt-5 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary">{question.type === 'truefalse' ? 'True / False' : 'Multiple choice'}</Badge>
          <button
            onClick={() => toggleBookmark(question.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
            aria-pressed={bookmarked}
          >
            <Bookmark className={cn('size-4', bookmarked && 'fill-primary text-primary')} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <h2 className="mt-4 text-lg leading-7 font-bold text-balance">{question.text}</h2>

        <div className="mt-5 flex flex-col gap-2.5">
          {question.options.map((option, i) => {
            const isSelected = selected.includes(i)
            const isCorrectOption = question.correct.includes(i)
            const revealed = mode === 'practice' && !!feedback
            return (
              <button
                key={i}
                onClick={() => select(i)}
                disabled={revealed}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors',
                  revealed && isCorrectOption && 'border-green-500 bg-green-50 text-green-900',
                  revealed && isSelected && !isCorrectOption && 'border-red-400 bg-red-50 text-red-900',
                  revealed && !isCorrectOption && !isSelected && 'border-border/70 opacity-60',
                  !revealed && (isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/40' : 'border-border/70 bg-card hover:bg-muted/50'),
                )}
              >
                <span
                  className={cn(
                    'flex size-6.5 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    revealed && isCorrectOption && 'border-green-500 bg-green-500 text-white',
                    revealed && isSelected && !isCorrectOption && 'border-red-400 bg-red-400 text-white',
                    !revealed && (isSelected ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground'),
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            )
          })}
        </div>

        {mode === 'practice' && feedback && (
          <div className={cn('mt-5 rounded-xl p-4 text-sm leading-6', feedback.correct ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900')}>
            <p className="flex items-center gap-2 font-bold">
              {feedback.correct ? <CircleCheck className="size-4.5 text-green-600" /> : <CircleX className="size-4.5 text-red-600" />}
              {feedback.correct ? 'Correct!' : 'Incorrect.'}
            </p>
            <p className="mt-1.5">{question.explanation}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {answeredCount}/{total} answered
          </p>
          {mode === 'practice' ? (
            feedback ? (
              <Button onClick={next} className="h-10 px-5 text-sm">
                {isLast ? 'Finish' : 'Next question'} <Flag className="size-4" />
              </Button>
            ) : (
              <Button onClick={submitAnswer} disabled={selected.length === 0} className="h-10 px-5 text-sm">
                Submit answer
              </Button>
            )
          ) : isLast ? (
            <Button onClick={next} className="h-10 px-5 text-sm">
              Submit test
            </Button>
          ) : (
            <Button onClick={next} className="h-10 px-5 text-sm">
              Next question
            </Button>
          )}
        </div>
      </article>

      <p className="mt-4 text-center">
        <Link href={session.introPath} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
          Quit and go back
        </Link>
      </p>
    </div>
  )
}
