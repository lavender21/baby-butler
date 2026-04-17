import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { initDatabase, getDatabase } from './db/init.js'
import { migrateFromJson } from './db/migrate.js'
import { ProfileDao } from './dao/profileDao.js'
import { SleepRecordDao } from './dao/sleepRecordDao.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 3001
const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 初始化数据库
initDatabase()

// 执行数据迁移（仅在首次运行时）
try {
  migrateFromJson()
} catch (error) {
  console.log('Migration skipped or already completed')
}

// 获取数据库连接
const db = getDatabase()
const profileDao = new ProfileDao(db)
const sleepRecordDao = new SleepRecordDao(db)

// 静态文件服务 - 图片
app.use('/images', express.static(path.join(__dirname, '../images')))

// ==================== API Routes ====================

// 获取 Profile
app.get('/api/profile', (req: Request, res: Response) => {
  try {
    const profile = profileDao.getProfile()
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    
    res.json(profile)
  } catch (error) {
    console.error('Error getting profile:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 更新 Profile
app.put('/api/profile', (req: Request, res: Response) => {
  try {
    const profile = profileDao.updateProfile(req.body)
    res.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 获取所有睡眠记录
app.get('/api/sleep-records', (req: Request, res: Response) => {
  try {
    const records = sleepRecordDao.getAllRecords()
    res.json(records)
  } catch (error) {
    console.error('Error getting sleep records:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 创建睡眠记录
app.post('/api/sleep-records', (req: Request, res: Response) => {
  try {
    const { sootheStart, sleepStart, sleepEnd } = req.body
    
    if (!sootheStart || !sleepStart || !sleepEnd) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    
    const record = {
      id: `r-${Date.now()}`,
      sootheStart,
      sleepStart,
      sleepEnd
    }
    
    const records = sleepRecordDao.createRecord(record)
    res.json(records)
  } catch (error) {
    console.error('Error creating sleep record:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 更新睡眠记录
app.put('/api/sleep-records/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { sootheStart, sleepStart, sleepEnd } = req.body
    
    if (!sootheStart || !sleepStart || !sleepEnd) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    
    const records = sleepRecordDao.updateRecord(id, {
      sootheStart,
      sleepStart,
      sleepEnd
    })
    
    if (!records) {
      return res.status(404).json({ message: 'Record not found' })
    }
    
    res.json(records)
  } catch (error) {
    console.error('Error updating sleep record:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 删除睡眠记录
app.delete('/api/sleep-records/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const records = sleepRecordDao.deleteRecord(id)
    
    if (!records) {
      return res.status(404).json({ message: 'Record not found' })
    }
    
    res.json(records)
  } catch (error) {
    console.error('Error deleting sleep record:', error)
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' })
})

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal Server Error', error: err.message })
})

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running: http://localhost:${PORT}`)
  console.log(`📊 Database: SQLite`)
  console.log(`✅ Ready to accept requests`)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...')
  db.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...')
  db.close()
  process.exit(0)
})
