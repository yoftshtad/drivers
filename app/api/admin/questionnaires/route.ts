import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getQuestionnaires, createQuestionnaire, deleteQuestionnaire, deleteQuestionnairesForModule } from '@/lib/db/questionnaires'
import { logAdminAction, type AuditAction } from '@/lib/db/audit'

export async function GET() {
  try {
    const questionnaires = await getQuestionnaires()
    return NextResponse.json({ questionnaires })
  } catch (e) {
    console.error('GET /api/admin/questionnaires error:', e)
    return NextResponse.json({ error: 'Failed to fetch questionnaires' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const questionnaire = await createQuestionnaire(body)
    await logAdminAction(session.user.id, 'create_questionnaire', questionnaire.id, body)
    return NextResponse.json({ questionnaire }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/questionnaires error:', e)
    return NextResponse.json({ error: 'Failed to create questionnaire' }, { status: 500 })
  }
}