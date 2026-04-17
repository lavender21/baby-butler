export class SleepRecordDao {
  constructor(db) {
    this.db = db
  }
  
  _rowToRecord(row) {
    return {
      id: row.id,
      sootheStart: row.soothe_start,
      sleepStart: row.sleep_start,
      sleepEnd: row.sleep_end
    }
  }
  
  getAllRecords() {
    const stmt = this.db.prepare(`
      SELECT * FROM sleep_records 
      ORDER BY soothe_start DESC
    `)
    
    const rows = stmt.all()
    return rows.map(row => this._rowToRecord(row))
  }
  
  getRecordById(id) {
    const stmt = this.db.prepare('SELECT * FROM sleep_records WHERE id = ?')
    const row = stmt.get(id)
    
    return row ? this._rowToRecord(row) : null
  }
  
  createRecord(record) {
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
  
  updateRecord(id, record) {
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
  
  deleteRecord(id) {
    const stmt = this.db.prepare('DELETE FROM sleep_records WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      return null
    }
    
    return this.getAllRecords()
  }
}
