'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { ArrowLeft, AlertCircle, CircleAlert, CircleCheck, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createQuestionnaire } from '@/lib/questionnaire-store'
import { createQuestion } from '@/lib/question-store'
import { cn } from '@/lib/utils'

const questionRowSchema = z.object({
  question: z.string().min(10, 'Question text too short (min 10 chars)'),
  optionA: z.string().min(1, 'Option A required'),
  optionB: z.string().min(1, 'Option B required'),
  optionC: z.string().optional().default(''),
  optionD: z.string().optional().default(''),
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], { message: 'Correct answer must be A, B, C or D' }),
  difficulty: z.enum(['easy', 'medium', 'hard'], { message: 'Difficulty must be easy, medium or hard' }),
  explanation: z.string().min(10, 'Explanation too short (min 10 chars)'),
})

type QuestionRow = z.infer<typeof questionRowSchema>

interface ParsedQuestionRow {
  row: number
  data: Record<string, unknown>
  result: { ok: true; value: QuestionRow } | { ok: false; errors: string[] }
}

const QUESTION_COLUMNS = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Difficulty', 'Explanation']

export default function ImportQuestionnairePage() {
  const router = useRouter()
  const questionsInputRef = useRef<HTMLInputElement>(null)
  
  const [fileName, setFileName] = useState<string | null>(null)
  const [questionRows, setQuestionRows] = useState<ParsedQuestionRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)
  const [parsing, setParsing] = useState(false)

  const validQuestionCount = questionRows?.filter((r) => r.result.ok).length ?? 0
  const invalidQuestionCount = (questionRows?.length ?? 0) - validQuestionCount

  const handleFile = async (file: File | undefined) => {
    setError(null)
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Unsupported file. Please upload an .xlsx, .xls or .csv spreadsheet.')
      return
    }
    setParsing(true)
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!sheet) throw new Error('The spreadsheet has no sheets.')
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

      const parsed: ParsedQuestionRow[] = json.map((raw, i) => {
        const data = {
          question: String(raw['Question'] ?? ''),
          optionA: String(raw['Option A'] ?? ''),
          optionB: String(raw['Option B'] ?? ''),
          optionC: String(raw['Option C'] ?? ''),
          optionD: String(raw['Option D'] ?? ''),
          correctAnswer: String(raw['Correct Answer'] ?? '').trim().toUpperCase(),
          difficulty: String(raw['Difficulty'] ?? '').trim().toLowerCase(),
          explanation: String(raw['Explanation'] ?? ''),
        }
        const result = questionRowSchema.safeParse(data)
        return result.success 
          ? { row: i + 2, data, result: { ok: true, value: result.data } }
          : { row: i + 2, data, result: { ok: false, errors: result.error.issues.map((issue) => issue.message) } }
      })

      if (parsed.length === 0) {
        setError('No data rows found. Check that row 1 contains the column headers.')
        setQuestionRows(null)
      } else {
        setQuestionRows(parsed)
        setFileName(file.name)
      }
    } catch {
      setError('Could not parse this file. Make sure it is a valid Excel or CSV file using the template.')
    } finally {
      setParsing(false)
    }
  }

  const downloadTemplate = () => {
    const sample = [
      {
        Question: 'What does a flashing yellow traffic light mean?',
        'Option A': 'Stop and wait',
        'Option B': 'Proceed with caution',
        'Option C': 'Speed up',
        'Option D': 'Turn around',
        'Correct Answer': 'B',
        Difficulty: 'easy',
        Explanation: 'A flashing yellow light means slow down and proceed with caution.',
      },
      {
        Question: 'At a four-way stop, who goes first?',
        'Option A': 'The vehicle on the left',
        'Option B': 'The vehicle on the right',
        'Option C': 'The larger vehicle',
        'Option D': 'The faster driver',
        'Correct Answer': 'B',
        Difficulty: 'easy',
        Explanation: 'When two vehicles arrive simultaneously, the driver on the left yields to the driver on the right.',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(sample, { header: QUESTION_COLUMNS })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    XLSX.writeFile(wb, 'driveprep-mock-test-template.xlsx')
  }

  const confirmImport = async () => {
    if (!questionRows) return
    
    const validQuestions = questionRows.filter(r => r.result.ok).map(r => r.result.value)
    if (validQuestions.length === 0) return setError('No valid questions to import')

    try {
      const questionIds: string[] = []
      
      const uploadModuleId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      for (const q of validQuestions) {
        const options = [q.optionA, q.optionB, q.optionC, q.optionD].map(o => o.trim()).filter(Boolean)
        const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)
        
        const newQuestion = await createQuestion({
          moduleId: uploadModuleId,
          type: 'single',
          text: q.question.trim(),
          options,
          correct: [correctIndex >= 0 ? correctIndex : 0],
          difficulty: q.difficulty,
          explanation: q.explanation.trim(),
        })
        questionIds.push(newQuestion.id)
      }

      if (questionIds.length === 0) return setError('No valid questions to import')

      // Get existing mock test count for auto-numbering
      const existing = await fetch('/api/admin/questionnaires', { cache: 'no-store' })
      const data = await existing.json()
      const existingCount = data.questionnaires?.filter((q: any) => q.title.startsWith('Mock Test')).length ?? 0
      const testNumber = existingCount + 1

      await createQuestionnaire({
        moduleId: uploadModuleId,
        title: `Mock Test ${testNumber}`,
        description: `Mock test with ${questionIds.length} questions from upload. No time limit. Answers shown at the end.`,
        questionCount: questionIds.length,
        passMark: 0,
        mode: 'mock',
      })

      setImported(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import mock test')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/questionnaires" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Questionnaires
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Import Mock Test from Excel</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Upload questions. Creates a mock test with no time limit, all questions used, score shown as percentile.
          </p>
        </div>
        <Button variant="outline" className="h-10 gap-2 px-4 text-sm" onClick={downloadTemplate}>
          <Download className="size-4" /> Download template
        </Button>
      </header>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="size-5 text-primary" />
          <div>
            <p className="font-semibold">Questions file</p>
            <p className="text-xs text-muted-foreground">Excel/CSV with columns: {QUESTION_COLUMNS.join(' · ')}</p>
          </div>
        </div>
        <input ref={questionsInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} aria-label="Questions Excel file" />
        
        {!questionRows && (
          <button
            type="button"
            onClick={() => questionsInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <FileSpreadsheet className="size-6 text-primary" />
            </span>
            <span className="text-sm font-semibold">{parsing ? 'Parsing spreadsheet…' : 'Click to select questions file'}</span>
            <span className="text-xs text-muted-foreground">Columns: {QUESTION_COLUMNS.join(' · ')}</span>
          </button>
        )}

        {questionRows && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <FileSpreadsheet className="size-5 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {questionRows.length} rows ·{' '}
                  <span className="font-semibold text-green-600">{validQuestionCount} valid</span>
                  {invalidQuestionCount > 0 && <span className="font-semibold text-destructive ml-1">· {invalidQuestionCount} invalid</span>}
                </p>
                <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => { setQuestionRows(null); setFileName(null); if (questionsInputRef.current) questionsInputRef.current.value = '' }}>
                  Choose another
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"><CircleAlert className="size-4 shrink-0" /> {error}</p>}

        <div className="mt-4 flex gap-2.5">
          <Button variant="outline" className="h-10 px-5 text-sm" onClick={() => { setQuestionRows(null); setFileName(null); if (questionsInputRef.current) questionsInputRef.current.value = '' }}>
            Clear
          </Button>
          <Button className="h-10 gap-2 px-5 text-sm bg-green-600 hover:bg-green-700" disabled={!questionRows || validQuestionCount === 0 || imported} onClick={confirmImport}>
            {imported
              ? <><CircleCheck className="size-4" /> Imported</>
              : validQuestionCount === 0
                ? <><AlertCircle className="size-4" /> No valid questions</>
                : <><Upload className="size-4" /> Create Mock Test ({validQuestionCount} questions)</>
            }
          </Button>
        </div>

        {imported && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-700 ring-1 ring-green-100">
            <CircleCheck className="size-4" /> Mock test imported successfully.
          </p>
        )}

        {error && <p className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"><CircleAlert className="size-4 shrink-0" /> {error}</p>}

        <div className="mt-4 flex flex-col gap-2">
          <p className="font-semibold">Import settings</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CircleCheck className="size-4 text-green-600" /> No time limit</li>
            <li className="flex items-center gap-2"><CircleCheck className="size-4 text-green-600" /> All {validQuestionCount} questions used</li>
            <li className="flex items-center gap-2"><CircleCheck className="size-4 text-green-600" /> Score shown as percentile (correct/total × 100)</li>
            <li className="flex items_center gap-2"><CircleCheck className="size-4 text-green-600" /> Answers shown at end</li>
            <li className="flex items-center gap-2"><CircleCheck className="size-4 text-green-600" /> Auto-titled: "Mock Test 1", "Mock Test 2", etc.</li>
          </ul>
        </div>
      </section>

      {questionRows && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <div className="border-b border-border/70 px-5 py-3.5">
            <h2 className="text-sm font-extrabold">Preview — nothing is inserted until you confirm</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Row</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="pr-5">Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionRows.map((r) => (
                <TableRow key={r.row} className={cn(!r.result.ok && 'bg-red-50/50')}>
                  <TableCell className="pl-5 text-muted-foreground">{r.row}</TableCell>
                  <TableCell className="max-w-sm">
                    <p className="truncate font-semibold">{String(r.data.question) || '—'}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{String(r.data.difficulty) || '—'}</TableCell>
                  <TableCell className="pr-5">
                    {r.result.ok ? (
                      <Badge variant="success">Valid</Badge>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="destructive">Invalid</Badge>
                        {r.result.errors.slice(0, 2).map((err, i) => (
                          <p key={i} className="text-xs text-destructive">{err}</p>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  )
}