import type Database from 'better-sqlite3'
import type { Profile, ProfileRow } from '../types/index.js'

export class ProfileDao {
  private db: Database.Database
  
  constructor(db: Database.Database) {
    this.db = db
  }
  
  getProfile(): Profile | null {
    const stmt = this.db.prepare('SELECT * FROM profile ORDER BY id DESC LIMIT 1')
    const row = stmt.get() as ProfileRow | undefined
    
    if (!row) {
      return null
    }
    
    return {
      name: row.name,
      birthday: row.birthday,
      gender: row.gender,
      avatarUrl: row.avatar_url
    }
  }
  
  updateProfile(data: Partial<Profile>): Profile {
    const profile = this.getProfile()
    
    if (!profile) {
      // 如果没有 profile，创建一个
      const stmt = this.db.prepare(`
        INSERT INTO profile (name, birthday, gender, avatar_url)
        VALUES (?, ?, ?, ?)
      `)
      
      stmt.run(
        data.name || '',
        data.birthday || '',
        data.gender || '',
        data.avatarUrl || ''
      )
    } else {
      // 更新现有 profile
      const stmt = this.db.prepare(`
        UPDATE profile 
        SET name = ?, birthday = ?, gender = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM profile ORDER BY id DESC LIMIT 1)
      `)
      
      stmt.run(
        data.name !== undefined ? data.name : profile.name,
        data.birthday !== undefined ? data.birthday : profile.birthday,
        data.gender !== undefined ? data.gender : profile.gender,
        data.avatarUrl !== undefined ? data.avatarUrl : profile.avatarUrl
      )
    }
    
    return this.getProfile()!
  }
}
