import { db, execute, executeRun } from './index'

export type AuditAction = 
  | 'approve_user'
  | 'reject_user'
  | 'approve_payment'
  | 'reject_payment'
  | 'delete_user'
  | 'update_user_role'
  | 'create_module'
  | 'update_module'
  | 'delete_module'
  | 'create_question'
  | 'update_question'
  | 'delete_question'
  | 'create_questionnaire'
  | 'update_questionnaire'
  | 'delete_questionnaire'

export interface AuditLogEntry {
  id: number
  admin_id: string
  action: AuditAction
  target_id: string
  metadata: Record<string, any> | null
  created_at: string
}

export async function logAdminAction(
  adminId: string,
  action: AuditAction,
  targetId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await executeRun(
      `INSERT INTO audit_log (admin_id, action, target_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, action, targetId, JSON.stringify(metadata), new Date().toISOString()]
    )
  } catch (e) {
    console.error('Failed to log admin action:', e)
  }
}

export async function getAuditLogs(
  options: {
    adminId?: string
    action?: AuditAction
    targetId?: string
    limit?: number
    offset?: number
  } = {}
): Promise<AuditLogEntry[]> {
  const { adminId, action, targetId, limit = 100, offset = 0 } = options
  
  let sql = 'SELECT * FROM audit_log WHERE 1=1'
  const args: any[] = []
  
  if (adminId) {
    sql += ' AND admin_id = ?'
    args.push(adminId)
  }
  if (action) {
    sql += ' AND action = ?'
    args.push(action)
  }
  if (targetId) {
    sql += ' AND target_id = ?'
    args.push(targetId)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  args.push(limit, offset)
  
  const rows = await execute<any>(sql, args)
  return rows.map((row: any) => ({
    id: row.id,
    admin_id: row.admin_id,
    action: row.action,
    target_id: row.target_id,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    created_at: row.created_at,
  }))
}