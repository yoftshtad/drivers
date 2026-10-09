import { NextRequest, NextResponse } from 'next/server'
import { getProgressMap, getModuleProgress, saveReadingProgress, deleteModuleProgress } from '@/lib/db/progress'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    if (moduleId) {
      const progress = await getModuleProgress(moduleId)
      return NextResponse.json({ progress })
    }
    const map = await getProgressMap()
    return NextResponse.json({ progress: map })
  } catch (e) {
    console.error('GET /api/student/progress error:', e)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moduleId, percent, completed } = body
    if (!moduleId || percent === undefined) {
      return NextResponse.json({ error: 'moduleId and percent required' }, { status: 400 })
    }
    await saveReadingProgress(moduleId, percent, completed)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/student/progress error:', e)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}