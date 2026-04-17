import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../../db/baby-butler.db')

export function initDatabase(): Database.Database {
  const db = new Database(dbPath)
  
  // 启用外键约束
  db.pragma('foreign_keys = ON')
  
  // 创建 profile 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birthday TEXT NOT NULL,
      gender TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 创建 sleep_records 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sleep_records (
      id TEXT PRIMARY KEY,
      soothe_start TEXT NOT NULL,
      sleep_start TEXT NOT NULL,
      sleep_end TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sleep_start ON sleep_records(sleep_start DESC)
  `)
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sleep_end ON sleep_records(sleep_end DESC)
  `)
  
  console.log('✅ Database initialized successfully')
  
  return db
}

export function getDatabase(): Database.Database {
  return new Database(dbPath)
}
