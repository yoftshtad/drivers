import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

async function main() {
  console.log('Testing module insert...')
  const modId = `mod-test-${Date.now()}`
  const now = new Date().toISOString()
  
  try {
    await db.execute({
      sql: `INSERT INTO modules (id, order_num, title, description, color, progress, question_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [modId, 1, 'Test Module', 'Test Description', 'blue', 0, 0, now, now]
    })
    console.log('✓ Module insert successful')
    
    const result = await db.execute('SELECT * FROM modules WHERE id = ?', [modId])
    console.log('Module:', result.rows)
  } catch (e: any) {
    console.error('Module insert failed:', e.message)
  }

  console.log('\nTesting questionnaire insert...')
  const qnrId = `qnr-test-${Date.now()}`
  
  try {
    await db.execute({
      sql: `INSERT INTO questionnaires (id, module_id, title, description, question_count, time_limit_min, pass_mark, mode, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [qnrId, modId, 'Test Questionnaire', 'Test Description', 10, 30, 70, 'practice', now, now]
    })
    console.log('✓ Questionnaire insert successful')
    
    const result = await db.execute('SELECT * FROM questionnaires WHERE id = ?', [qnrId])
    console.log('Questionnaire:', result.rows)
  } catch (e: any) {
    console.error('Questionnaire insert failed:', e.message)
  }

  // Cleanup
  await db.execute('DELETE FROM questionnaires WHERE id = ?', [qnrId])
  await db.execute('DELETE FROM modules WHERE id = ?', [modId])
  console.log('\nCleanup done')
}

main()