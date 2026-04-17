import type Database from 'better-sqlite3'
import type { SleepRecord, SleepRecordRow } from '../types/index.js'

export class SleepRecordDao {
  private db: Database.Database
  
  constructor(db: Database.Database) {
    this.db = db
  }
  
  private _rowToRecord(row: SleepRecordRow): SleepRecord {
    return {
      id: row.id,
      sootheStart: row.soothe_start,
      sleepStart: row.sleep_start,
      sleepEnd: row.sleep_end
    }
  }
  
  getAllRecords(): SleepRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sleep_records 
      ORDER BY soothe_start DESC
    `)
    
    const rows = stmt.all() as SleepRecordRow[]
    return rows.map(row => this._rowToRecord(row))
  }
  
  getRecordById(id: string): SleepRecord | null {
    const stmt = this.db.prepare('SELECT * FROM sleep_records WHERE id = ?')
    const row = stmt.get(id) as SleepRecordRow | undefined
    
    return row ? this._rowToRecord(row) : null
  }
  
  createRecord(record: SleepRecord): SleepRecord[] {
    const stmt = this.db.prepare(`
      INSERT INTO sleep_records (id, soothe_start, sleep_start, sleep_end)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run(
      record.id,
      record.sootheStart,
      record.sleepStart,
      record.sleepEnd
    )
    
    return this.getAllRecords()
  }
  
  updateRecord(id: string, record: Omit<SleepRecord, 'id'>): SleepRecord[] | null {
    const stmt = this.db.prepare(`
      UPDATE sleep_records 
      SET soothe_start = ?, sleep_start = ?, sleep_end = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      record.sootheStart,
      record.sleepStart,
      record.sleepEnd,
      id
    )
    
    if (result.changes === 0) {
      return null
    }
    
    return this.getAllRecords()
  }
  
  deleteRecord(id: string): SleepRecord[] | null {
    const stmt = this.db.prepare('DELETE FROM sleep_records WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      return null
    }
    
    return this.getAllRecords()
  }
}
