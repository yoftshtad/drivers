import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
}

const db = createClient({ url, authToken })

async function main() {
  console.log('Clearing sample data from database...')

  const tables = [
    'attempts',
    'reading_progress',
    'last_attempt',
    'payments',
    'questions',
    'questionnaires',
    'modules',
  ]

  for (const table of tables) {
    try {
      await db.execute(`DELETE FROM ${table}`)
      console.log(`✓ Cleared ${table}`)
    } catch (e: any) {
      if (e.message?.includes('no such table')) {
        console.log(`- Skipped ${table} (not found)`)
      } else {
        throw e
      }
    }
  }

  try {
    await db.execute('DELETE FROM users WHERE email != ?', ['admin@driveprep.com'])
    console.log('✓ Cleared non-admin users')
  } catch (e: any) {
    if (e.message?.includes('no such table')) {
      console.log('- Skipped users (not found)')
    } else {
      throw e
    }
  }

  console.log('\nDone! Database cleared of sample data.')
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})