import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getModules, createModule, updateModule, deleteModule, replaceModules } from '@/lib/db/modules'
import { logAdminAction, type AuditAction } from '@/lib/db/audit'

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
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (Array.isArray(body)) {
      await replaceModules(body)
      await logAdminAction(session.user.id, 'update_module', 'bulk', { count: body.length })
      return NextResponse.json({ success: true })
    }
    const module = await createModule(body)
    await logAdminAction(session.user.id, 'create_module', module.id, body)
    return NextResponse.json({ module }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/modules error:', e)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}