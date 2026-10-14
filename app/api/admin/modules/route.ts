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

export async function DELETE(request: NextRequest) {
  let session = null
  try {
    session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - no admin session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId required' }, { status: 400 })
    }

    await deleteModule(moduleId)
    await logAdminAction(session.user.id, 'delete_module', moduleId)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/modules error:', e)
    const errorMessage = e instanceof Error ? e.message : 'Failed to delete module'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}