import { NextRequest, NextResponse } from 'next/server'
import { getQuestions, createQuestion, deleteQuestion, deleteQuestionsForModule } from '@/lib/db/questions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const questions = moduleId ? await getQuestionsFor(moduleId) : await getQuestions()
    return NextResponse.json({ questions })
  } catch (e) {
    console.error('GET /api/admin/questions error:', e)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = await createQuestion(body)
    return NextResponse.json({ question }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/questions error:', e)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}