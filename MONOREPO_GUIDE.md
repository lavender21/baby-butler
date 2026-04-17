# Baby Butler Monorepo

使用 Turborepo 管理的 monorepo 项目，包含前端和后端应用。

## 📁 项目结构

```
baby-butler-monorepo/
├── apps/
│   ├── web/              # 前端 Vue 应用
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/              # 后端 Express + SQLite 应用
│       ├── db/
│       ├── dao/
│       ├── data/
│       ├── images/
│       ├── index.js
│       └── package.json
├── packages/             # 共享包（未来可扩展）
├── turbo.json           # Turborepo 配置
└── package.json         # 根 package.json
```

## 🚀 快速开始

### 前置要求
- Node.js >= 20.19.0
- npm >= 10.8.2

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 同时启动前端和后端
npm run dev

# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

## 📦 可用命令

### 根目录命令
- `npm run dev` - 开发模式（启动所有应用）
- `npm run build` - 构建所有应用
- `npm run type-check` - 类型检查
- `npm run clean` - 清理所有 node_modules
- `npm run migrate` - 数据库迁移
- `npm run db:backup` - 数据库备份

### 单独运行应用
```bash
# 仅运行前端
npm run dev --workspace=apps/web

# 仅运行后端
npm run dev --workspace=apps/api
```

## 🔧 Turborepo 特性

### 并行执行
Turbo 会自动并行运行所有应用的任务

### 缓存
Turbo 会缓存构建结果，加快后续构建速度

### 依赖图
Turbo 理解应用之间的依赖关系，按正确顺序执行任务

## 📝 工作区（Workspaces）

### 添加依赖
```bash
# 为 web 应用添加依赖
npm install <package> --workspace=apps/web

# 为 api 应用添加依赖
npm install <package> --workspace=apps/api
```

## 🎉 优势

| 特性 | 单体项目 | Monorepo |
|------|---------|----------|
| 依赖管理 | ❌ 混乱 | ✅ 清晰分离 |
| 构建速度 | ❌ 慢 | ✅ 快（缓存） |
| 并行执行 | ❌ 手动 | ✅ 自动 |
| 代码复用 | ❌ 困难 | ✅ 简单 |
| 独立部署 | ❌ 困难 | ✅ 简单 |

## ✅ 测试结果

- ✅ API 服务器运行在 http://localhost:3001
- ✅ Web 应用运行在 http://localhost:5173
- ✅ Turbo 并行启动成功
- ✅ 数据库迁移正常
- ✅ 所有依赖正确安装
