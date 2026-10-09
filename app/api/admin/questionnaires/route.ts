import { NextRequest, NextResponse } from 'next/server'
import { getQuestionnaires, createQuestionnaire, deleteQuestionnaire, deleteQuestionnairesForModule } from '@/lib/db/questionnaires'

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
    const body = await request.json()
    const questionnaire = await createQuestionnaire(body)
    return NextResponse.json({ questionnaire }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/questionnaires error:', e)
    return NextResponse.json({ error: 'Failed to create questionnaire' }, { status: 500 })
  }
}