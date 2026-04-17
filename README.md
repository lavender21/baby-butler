# Baby Butler

A mobile-first Vue 3 app for tracking a baby's sleep. Parents can log soothe-to-sleep sessions in real time, review yesterday's sleep metrics on the home dashboard, browse and edit the full history, and manage the baby's profile.

## Features

- **Home dashboard** — yesterday's sleep overview: total duration, night vs. daytime naps, average soothe time, average sleep interval, hourly sleep/awake distribution chart, and a 7-day trend line.
- **Live sleep recording** — tap to start soothing → mark when baby falls asleep → tap to end. Each session captures `sootheStart`, `sleepStart`, and `sleepEnd`.
- **Manual records** — create or edit sleep records with custom timestamps.
- **History view** — browse all past sleep records grouped by date with 奶睡 tags, delete and edit actions.
- **Baby profile** — store name, birthday, gender, and avatar; age is auto-calculated and shown in the header.

## Tech Stack

### Frontend (`apps/web`)
| Layer | Choice |
|---|---|
| UI framework | Vue 3 (`<script setup>`) + Vant 4 component library |
| State management | Pinia |
| Charts | ECharts 6 |
| Routing | Vue Router 5 (hash history) |
| Date handling | Day.js |
| Build tool | Vite + TypeScript |

### Backend (`apps/api`)
| Layer | Choice |
|---|---|
| Runtime | Node.js 20.19.0 |
| Framework | Express 5 |
| Database | SQLite (better-sqlite3) |
| Language | TypeScript |
| Dev runner | tsx |

### Monorepo
| Tool | Purpose |
|---|---|
| Turborepo | Task orchestration, caching, parallel execution |
| npm workspaces | Dependency management |

## Project Structure

```
baby-butler-monorepo/
├── apps/
│   ├── web/                    # Frontend Vue application
│   │   ├── src/
│   │   │   ├── views/          # Page components (Home, Record, History, Profile)
│   │   │   ├── components/     # Shared components (BabyHeader, AppTabbar)
│   │   │   ├── stores/         # Pinia store (sleep.ts)
│   │   │   ├── services/       # REST API client (sleepApi.ts)
│   │   │   ├── utils/          # Sleep metrics calculations (sleepMetrics.ts)
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   └── router/         # Vue Router configuration
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                    # Backend Express + SQLite application
│       ├── src/
│       │   ├── types/          # TypeScript type definitions
│       │   ├── db/             # Database initialization & migration
│       │   ├── dao/            # Data access layer (ProfileDao, SleepRecordDao)
│       │   └── index.ts        # Main Express server
│       ├── db/                 # SQLite database files
│       ├── data/               # JSON data for migration
│       ├── images/             # Static assets (avatars)
│       ├── tsconfig.json
│       └── package.json
├── packages/                   # Shared packages (future expansion)
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json with workspaces
```

## Getting Started

### Prerequisites
- Node.js >= 20.19.0
- npm >= 10.8.2

### Installation
```bash
# Install all dependencies for all workspaces
npm install
```

### Development

```bash
# Start both frontend and backend in parallel
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

Vite automatically proxies `/api/*` and `/images/*` requests to the backend server.

### Database Setup

The database is automatically initialized on first run. To manually migrate data:

```bash
# Migrate data from JSON to SQLite
npm run migrate

# Backup database
npm run db:backup
```

## Available Commands

### Root Commands
```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all apps for production
npm run type-check   # Type check all TypeScript code
npm run clean        # Remove all node_modules
npm run migrate      # Run database migration
npm run db:backup    # Backup SQLite database
```

### Workspace-Specific Commands
```bash
# Run frontend only
npm run dev --workspace=apps/web

# Run backend only
npm run dev --workspace=apps/api

# Type check frontend
npm run type-check --workspace=apps/web

# Type check backend
npm run type-check --workspace=apps/api
```

### Adding Dependencies
```bash
# Add dependency to frontend
npm install <package> --workspace=apps/web

# Add dependency to backend
npm install <package> --workspace=apps/api

# Add dev dependency to root
npm install -D <package> -w root
```

## API Endpoints

### Profile
- `GET /api/profile` - Get baby profile
- `PUT /api/profile` - Update baby profile

### Sleep Records
- `GET /api/sleep-records` - Get all sleep records
- `POST /api/sleep-records` - Create new sleep record
- `PUT /api/sleep-records/:id` - Update sleep record
- `DELETE /api/sleep-records/:id` - Delete sleep record

### Static Assets
- `GET /images/*` - Serve avatar images

## Database Schema

### `profile` table
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

### `sleep_records` table
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

## Monorepo Benefits

| Feature | Before (Monolith) | After (Monorepo) |
|---------|-------------------|------------------|
| Dependency management | ❌ Mixed together | ✅ Clearly separated |
| Build speed | ❌ Slow | ✅ Fast (with caching) |
| Parallel execution | ❌ Manual | ✅ Automatic |
| Code reuse | ❌ Difficult | ✅ Easy (shared packages) |
| Independent deployment | ❌ Difficult | ✅ Simple |
| Type safety | ⚠️ Partial | ✅ Full TypeScript |

## Turborepo Features

### Parallel Execution
Turbo automatically runs tasks in parallel across all workspaces when possible.

### Smart Caching
Build outputs are cached. If nothing changed, Turbo skips the task and restores from cache.

### Dependency Graph
Turbo understands workspace dependencies and executes tasks in the correct order.

### Task Pipeline
Configured in `turbo.json`:
```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

## Development Workflow

1. **Start development servers**
   ```bash
   npm run dev
   ```

2. **Make changes** to frontend or backend code
   - Frontend changes trigger Vite HMR
   - Backend changes require manual restart (or use nodemon)

3. **Type check** before committing
   ```bash
   npm run type-check
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Production Build

```bash
# Build all apps
npm run build

# Frontend output: apps/web/dist/
# Backend output: apps/api/dist/ (TypeScript compiled)
```

## Migration History

- ✅ **v1.0** - Initial Vue 3 + Node.js app with JSON storage
- ✅ **v2.0** - Upgraded to Express + SQLite database
- ✅ **v3.0** - Converted to Turborepo monorepo structure
- ✅ **v4.0** - Migrated backend to TypeScript

See `UPGRADE_SUMMARY.md` and `apps/api/TYPESCRIPT_MIGRATION.md` for detailed migration notes.

## License

Private project for personal use.
