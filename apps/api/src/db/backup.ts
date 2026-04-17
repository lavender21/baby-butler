import { copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function backupDatabase(): void {
  const dbPath = join(__dirname, '../../db/baby-butler.db')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = join(__dirname, `../../db/baby-butler-backup-${timestamp}.db`)
  
  try {
    copyFileSync(dbPath, backupPath)
    console.log(`✅ Database backed up to: ${backupPath}`)
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

// 如果直接运行此脚本，执行备份
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase()
}
