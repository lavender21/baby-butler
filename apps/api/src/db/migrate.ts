import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initDatabase } from './init.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface JsonData {
  profile: {
    name: string
    birthday: string
    gender: string
    avatarUrl: string
  }
  sleepRecords: Array<{
    id: string
    sootheStart: string
    sleepStart: string
    sleepEnd: string
  }>
}

export function migrateFromJson(): void {
  const db = initDatabase()
  
  try {
    // 读取 JSON 数据
    const jsonPath = join(__dirname, '../../data/db.json')
    const jsonData: JsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    
    // 检查是否已有数据
    const profileCount = db.prepare('SELECT COUNT(*) as count FROM profile').get() as { count: number }
    const recordsCount = db.prepare('SELECT COUNT(*) as count FROM sleep_records').get() as { count: number }
    
    if (profileCount.count > 0 || recordsCount.count > 0) {
      console.log('⚠️  Database already has data, skipping migration')
      db.close()
      return
    }
    
    // 开始事务
    const migrate = db.transaction(() => {
      // 迁移 profile
      const insertProfile = db.prepare(`
        INSERT INTO profile (name, birthday, gender, avatar_url)
        VALUES (?, ?, ?, ?)
      `)
      
      insertProfile.run(
        jsonData.profile.name,
        jsonData.profile.birthday,
        jsonData.profile.gender,
        jsonData.profile.avatarUrl
      )
      
      // 迁移 sleep_records
      const insertRecord = db.prepare(`
        INSERT INTO sleep_records (id, soothe_start, sleep_start, sleep_end)
        VALUES (?, ?, ?, ?)
      `)
      
      for (const record of jsonData.sleepRecords) {
        insertRecord.run(
          record.id,
          record.sootheStart,
          record.sleepStart,
          record.sleepEnd
        )
      }
      
      console.log(`✅ Migrated ${jsonData.sleepRecords.length} sleep records`)
      console.log('✅ Migrated profile data')
    })
    
    migrate()
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    db.close()
  }
}

// 如果直接运行此脚本，执行迁移
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateFromJson()
}
