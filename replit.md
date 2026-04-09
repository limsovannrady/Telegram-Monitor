# Telegram Bot Monitor

## Overview

A web dashboard for monitoring Telegram bot activity in real-time. The app polls the Telegram Bot API every 5 seconds, stores messages in PostgreSQL, and provides a dashboard with stats, message logs, and the ability to send messages through the bot.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts

## Architecture

- `artifacts/telegram-monitor/` — React frontend dashboard
- `artifacts/api-server/` — Express API server with Telegram bot integration
  - `src/lib/telegram.ts` — Telegram Bot API client
  - `src/lib/poller.ts` — Background polling service (5s interval)
  - `src/routes/bot.ts` — Bot info and raw updates endpoints
  - `src/routes/messages.ts` — Message CRUD and send endpoints
  - `src/routes/dashboard.ts` — Dashboard stats, activity, chats, message counts
- `lib/db/` — Database schema (messages table with unique update_id index)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables

- `TELEGRAM_BOT_TOKEN` — Telegram Bot API token (from @BotFather)
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` — Session secret

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
