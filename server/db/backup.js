import { copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, 'baby-butler.db')
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
const backupPath = join(__dirname, `baby-butler-backup-${timestamp}.db`)

try {
  copyFileSync(dbPath, backupPath)
  console.log(`✅ Database backed up to: ${backupPath}`)
} catch (error) {
  console.error('❌ Backup failed:', error.message)
  process.exit(1)
}
