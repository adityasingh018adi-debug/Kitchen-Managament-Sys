# KitchenOS AI

AI-powered Central Kitchen Management System. This repository is a foundation
for the full enterprise spec — a working core, plus a schema and architecture
that the remaining modules slot into.

## Stack

- **apps/web** — Next.js (App Router) + TypeScript + Tailwind CSS, PWA manifest
- **apps/api** — NestJS + Prisma + PostgreSQL, JWT auth with role-based access
- **packages/db** — Shared Prisma schema covering every module in the spec

## What's fully implemented

- **Auth & RBAC** — JWT login, three roles (`SUPER_ADMIN`, `ADMIN`, `STAFF`), 2FA OTP hook,
  password changes restricted to Super Admin only.
- **Departments** — CRUD + PIN management (PIN changeable by Admin/Super Admin only).
- **Employees** — directory, status (active/inactive), shift assignment.
- **Recipe Management** — full recipe CRUD with ingredients, method, shelf life, etc.
- **Smart Recipe Calculator** — `GET /recipes/:id/scale?portions=N` scales every ingredient
  automatically from the recipe's reference batch size. UI lives on the recipe detail page.
- **Task Management** — create/assign tasks, Start/Finish with automatic timing, photo proof,
  status board (Pending/Working/Completed/Cancelled).
- **AI Food Quality Inspection (interface)** — finishing a task with a photo automatically
  runs `VisionProvider.inspectFood()` and stores a `QualityInspection` record. Currently bound
  to `MockVisionProvider`; swap in an OpenAI/Gemini Vision-backed provider behind the same
  interface (`apps/api/src/ai/interfaces/vision-provider.interface.ts`) — no other code changes.
- **Attendance** — punch in/out with late/early detection from shift + grace period, GPS/IP/device
  capture, auto WhatsApp/push alert on late punch-in (currently logged by stub channels).
- **Dashboard** — live summary (today's tasks, completions, late count, pending tasks, avg quality).
- **Notifications** — persisted notification log with pluggable channel handlers
  (`IN_APP` is real; `PUSH`/`WHATSAPP` are no-op stubs pending Firebase/WhatsApp Cloud API creds).
- **Audit Log** — every mutation in the modules above writes an `AuditLog` row.

## What's schema-ready but UI-stubbed ("Coming soon")

Inventory, Reports, AI Analytics/Assistant, full WhatsApp dashboard, Face Recognition
enrollment UI, and the full Admin Panel have their database models and (where applicable)
API building blocks in place, but no dedicated UI yet. Each stub page says so explicitly.

## Why AI/Face Recognition/WhatsApp are stubbed

These all require external credentials (OpenAI/Gemini API keys, a face-recognition SDK,
a WhatsApp Business/Cloud API account, Firebase). Rather than fake working integrations,
every one of them sits behind a small provider interface:

- `apps/api/src/ai/interfaces/vision-provider.interface.ts` — food inspection
- `apps/api/src/ai/interfaces/face-recognition-provider.interface.ts` — face enrollment/match
- `apps/api/src/notifications/interfaces/notification-channel.interface.ts` — push/WhatsApp/email

Bind a real implementation to the same interface/token and the rest of the app (UI, DB writes,
business logic) needs no changes.

## Local setup

```bash
cp .env.example .env          # edit DATABASE_URL/JWT_SECRET as needed
docker compose up -d          # postgres + redis
npm install
npm run prisma:generate
npm run --workspace=packages/db migrate
npm run --workspace=packages/db seed   # creates "superadmin" + the 7 departments from the spec
npm run dev:api                # http://localhost:4000/api
npm run dev:web                # http://localhost:3000
```

Default seeded login: `superadmin` / `ChangeMe123!` (override via `SEED_SUPER_ADMIN_PASSWORD`).
Departments seed with PIN `0000`, matching the spec's example.

## Roadmap (next increments)

1. File uploads to Cloudflare R2/S3 (recipe photos/videos, task photo proof) instead of raw URLs.
2. Real vision provider (OpenAI/Gemini Vision) behind `VisionProvider`.
3. Real face-recognition provider + camera capture flow for the attendance kiosk.
4. WhatsApp Cloud API + Firebase Cloud Messaging channel implementations.
5. Inventory, Reports (Excel/PDF export), AI Analytics/Assistant UI.
6. Admin Panel: user management, permissions editor, audit log viewer.
7. Offline support / service worker for full PWA installability.
