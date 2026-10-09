import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

async function main() {
  console.log('Checking database tables...\n')

  const tables = ['users', 'payments', 'questions', 'questionnaires', 'modules', 'reading_progress', 'attempts', 'last_attempt']

  for (const table of tables) {
    try {
      const result = await db.execute(`SELECT COUNT(*) as count FROM ${table}`)
      console.log(`${table}: ${result.rows[0]?.count ?? 0} rows`)
    } catch (e: any) {
      console.log(`${table}: NOT FOUND (${e.message?.split(':')[0]})`)
    }
  }

  console.log('\n--- Users table data ---')
  try {
    const users = await db.execute('SELECT * FROM users')
    console.log(users.rows)
  } catch (e: any) {
    console.log('Error:', e.message)
  }
}

main().catch(console.error)