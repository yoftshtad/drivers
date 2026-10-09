import { NextRequest, NextResponse } from 'next/server'
import { getModules, createModule, updateModule, deleteModule, replaceModules } from '@/lib/db/modules'

export async function GET() {
  try {
    const modules = await getModules()
    return NextResponse.json({ modules })
  } catch (e) {
    console.error('GET /api/admin/modules error:', e)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (Array.isArray(body)) {
      await replaceModules(body)
      return NextResponse.json({ success: true })
    }
    const module = await createModule(body)
    return NextResponse.json({ module }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/modules error:', e)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}