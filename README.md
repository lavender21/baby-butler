# Baby Butler

A mobile-first Vue 3 app for tracking a baby's sleep. Parents can log soothe-to-sleep sessions in real time, review yesterday's sleep metrics on the home dashboard, browse and edit the full history, and manage the baby's profile.

## Features

- **Home dashboard** — yesterday's sleep overview: total duration, night vs. daytime naps, average soothe time, average sleep interval, hourly sleep/awake distribution chart, and a 7-day trend line.
- **Live sleep recording** — tap to start soothing → mark when baby falls asleep → tap to end. Each session captures `sootheStart`, `sleepStart`, and `sleepEnd`.
- **Manual records** — create or edit sleep records with custom timestamps.
- **History view** — browse all past sleep records with delete and edit actions.
- **Baby profile** — store name, birthday, gender, and avatar; age is auto-calculated and shown in the header.

## Tech stack

| Layer | Choice |
|---|---|
| UI framework | Vue 3 (`<script setup>`) + Vant 4 component library |
| State management | Pinia |
| Charts | ECharts 6 |
| Routing | Vue Router 5 (hash history) |
| Date handling | Day.js |
| Local API server | Plain Node.js HTTP server (`server/index.mjs`) |
| Data persistence | JSON file (`server/data/db.json`) |
| Build tool | Vite + TypeScript |

## Project structure

```
src/
  views/          # Page-level components (Home, Record, History, Profile, …)
  components/     # Shared components (BabyHeader)
  stores/         # Pinia store (sleep.ts) — state, computed metrics, API actions
  services/       # REST API client (sleepApi.ts)
  utils/          # Sleep metric calculations and formatters (sleepMetrics.ts)
  types/          # TypeScript interfaces (SleepRecord, BabyProfile, DailyMetrics, …)
  router/         # Vue Router configuration
server/
  index.mjs       # Lightweight REST API (profile + sleep records CRUD)
  data/db.json    # Persistent JSON database
```

## Getting started

```bash
# Install dependencies
npm install

# Start both the API server (port 3001) and Vite dev server
npm run dev

# Type-check
npm run type-check

# Production build
npm run build
```

Vite proxies `/api/*` and `/images/*` requests to the local API server, so no extra configuration is needed during development.
