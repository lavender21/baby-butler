import http from 'node:http'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const PORT = 3001
const DB_PATH = path.resolve(process.cwd(), 'server/data/db.json')
const IMAGES_DIR = path.resolve(process.cwd(), 'server/images')

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

async function readDb() {
  const content = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(content)
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function getSleepRecordId(url = '') {
  const matched = url.match(/^\/api\/sleep-records\/([^/]+)$/)
  return matched ? decodeURIComponent(matched[1]) : ''
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, { ok: true })
      return
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && req.url?.startsWith('/images/')) {
      const urlPath = decodeURIComponent(req.url.split('?')[0] || '')
      const relative = urlPath.replace(/^\/images\//, '')
      const resolved = path.resolve(IMAGES_DIR, relative)

      if (!resolved.startsWith(IMAGES_DIR + path.sep)) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Bad Request')
        return
      }

      try {
        const file = await fs.readFile(resolved)
        res.writeHead(200, {
          'Content-Type': getContentType(resolved),
          'Cache-Control': 'no-cache'
        })
        res.end(req.method === 'HEAD' ? undefined : file)
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not Found')
      }
      return
    }

    if (req.url === '/api/profile' && req.method === 'GET') {
      const db = await readDb()
      sendJson(res, 200, db.profile)
      return
    }

    if (req.url === '/api/profile' && req.method === 'PUT') {
      const db = await readDb()
      const payload = await parseBody(req)
      db.profile = { ...db.profile, ...payload }
      await writeDb(db)
      sendJson(res, 200, db.profile)
      return
    }

    if (req.url === '/api/sleep-records' && req.method === 'GET') {
      const db = await readDb()
      const sorted = [...db.sleepRecords].sort(
        (a, b) => new Date(b.sootheStart).getTime() - new Date(a.sootheStart).getTime()
      )
      sendJson(res, 200, sorted)
      return
    }

    if (req.url === '/api/sleep-records' && req.method === 'POST') {
      const db = await readDb()
      const payload = await parseBody(req)
      db.sleepRecords.push({ id: `r-${Date.now()}`, ...payload })
      await writeDb(db)
      sendJson(res, 200, db.sleepRecords)
      return
    }

    if (req.method === 'PUT' && req.url?.startsWith('/api/sleep-records/')) {
      const db = await readDb()
      const recordId = getSleepRecordId(req.url)
      const payload = await parseBody(req)
      const index = db.sleepRecords.findIndex((item) => item.id === recordId)

      if (index < 0) {
        sendJson(res, 404, { message: 'Record not found' })
        return
      }

      db.sleepRecords[index] = {
        ...db.sleepRecords[index],
        ...payload,
        id: db.sleepRecords[index].id
      }
      await writeDb(db)
      sendJson(res, 200, db.sleepRecords)
      return
    }

    if (req.method === 'DELETE' && req.url?.startsWith('/api/sleep-records/')) {
      const db = await readDb()
      const recordId = getSleepRecordId(req.url)
      const nextRecords = db.sleepRecords.filter((item) => item.id !== recordId)

      if (nextRecords.length === db.sleepRecords.length) {
        sendJson(res, 404, { message: 'Record not found' })
        return
      }

      db.sleepRecords = nextRecords
      await writeDb(db)
      sendJson(res, 200, db.sleepRecords)
      return
    }

    sendJson(res, 404, { message: 'Not Found' })
  } catch (error) {
    sendJson(res, 500, { message: 'Server Error', error: String(error) })
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running: http://localhost:${PORT}`)
})
