# Baby Butler Server

基于 Node.js + Express + SQLite 的后端服务

## 技术栈

- **Node.js** v20.19.0+
- **Express** - Web 框架
- **better-sqlite3** - SQLite 数据库驱动
- **CORS** - 跨域支持

## 数据库结构

### profile 表
```sql
CREATE TABLE profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthday TEXT NOT NULL,
  gender TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### sleep_records 表
```sql
CREATE TABLE sleep_records (
  id TEXT PRIMARY KEY,
  soothe_start TEXT NOT NULL,
  sleep_start TEXT NOT NULL,
  sleep_end TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## API 接口

### Profile

- `GET /api/profile` - 获取宝宝信息
- `PUT /api/profile` - 更新宝宝信息

### Sleep Records

- `GET /api/sleep-records` - 获取所有睡眠记录
- `POST /api/sleep-records` - 创建睡眠记录
- `PUT /api/sleep-records/:id` - 更新睡眠记录
- `DELETE /api/sleep-records/:id` - 删除睡眠记录

### Static Files

- `GET /images/*` - 获取图片资源

## 开发命令

```bash
# 启动开发服务器（前端 + 后端）
npm run dev

# 仅启动后端服务器
npm run dev:api

# 手动执行数据迁移
npm run migrate
```

## 数据迁移

首次启动时，服务器会自动从 `server/data/db.json` 迁移数据到 SQLite 数据库。

如果需要手动迁移：
```bash
npm run migrate
```

## 数据库文件位置

- 数据库文件：`server/db/baby-butler.db`
- 数据库文件已添加到 `.gitignore`，不会提交到版本控制

## 项目结构

```
server/
├── db/
│   ├── init.js          # 数据库初始化
│   ├── migrate.js       # 数据迁移脚本
│   └── baby-butler.db   # SQLite 数据库文件（自动生成）
├── dao/
│   ├── profileDao.js    # Profile 数据访问层
│   └── sleepRecordDao.js # Sleep Record 数据访问层
├── data/
│   └── db.json          # 原始 JSON 数据（用于迁移）
├── images/              # 静态图片资源
├── index.js             # Express 服务器入口
└── README.md            # 本文档
```

## 注意事项

1. 数据库文件会在首次运行时自动创建
2. 数据迁移只会执行一次，如果数据库已有数据则跳过
3. 所有 API 接口保持与原版本兼容，前端无需修改
4. 数据库使用 WAL 模式，支持并发读取
5. 所有时间字段使用 ISO 8601 格式存储
