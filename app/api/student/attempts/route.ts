import { NextRequest, NextResponse } from 'next/server'
import { getAttempts, saveAttempt, setLastAttempt, getLastAttempt } from '@/lib/db/attempts'
import type { AttemptRecord, LastAttempt } from '@/lib/db/attempts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const last = searchParams.get('last')
    if (last === 'true') {
      const attempt = await getLastAttempt()
      return NextResponse.json({ attempt })
    }
    const attempts = await getAttempts()
    return NextResponse.json({ attempts })
  } catch (e) {
    console.error('GET /api/student/attempts error:', e)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attempt, lastAttempt } = body as { attempt?: AttemptRecord; lastAttempt?: LastAttempt }
    if (attempt) {
      await saveAttempt(attempt)
    }
    if (lastAttempt) {
      await setLastAttempt(lastAttempt)
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/student/attempts error:', e)
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  }
}