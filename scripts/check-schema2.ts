import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

async function main() {
  console.log('Checking table schemas...\n')
  
  const tables = ['questionnaires', 'modules']
  
  for (const table of tables) {
    try {
      const result = await db.execute(`PRAGMA table_info(${table})`)
      console.log(`=== ${table} ===`)
      for (const row of result.rows) {
        console.log(`  ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PK' : ''}`)
      }
      console.log()
    } catch (e: any) {
      console.log(`=== ${table} === NOT FOUND\n`)
    }
  }
}

main()