import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getQuestions, createQuestion, deleteQuestion, deleteQuestionsForModule } from '@/lib/db/questions'
import { logAdminAction, type AuditAction } from '@/lib/db/audit'

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
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const question = await createQuestion(body)
    await logAdminAction(session.user.id, 'create_question', question.id, body)
    return NextResponse.json({ question }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/questions error:', e)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - no admin session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId required' }, { status: 400 })
    }

    await deleteQuestionsForModule(moduleId)
    await logAdminAction(session.user.id, 'delete_question', `module:${moduleId}`)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/questions error:', e)
    const errorMessage = e instanceof Error ? e.message : 'Failed to delete questions for module'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}