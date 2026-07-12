# Architecture Overview

High-level components:
- Frontend: Single Page Application (React + Vite + TypeScript) communicating with backend APIs. Responsible for dashboards, forms, and real-time status views.
- Backend API: Node.js + Express (TypeScript) implementing business rules, authentication, validation, and integration with persistence layers.
- Database: Primary relational database (Postgres for production, SQLite for local dev) accessed via Prisma for typed queries and migrations.
- Background Workers: Redis + BullMQ (optional) for scheduled jobs (license reminders, heavy report recalculations).
- Object Storage: S3-compatible storage for documents and large files; CDN for serving assets in production.
- Monitoring & Logging: Structured logs and request traces; integrate Sentry or similar for error monitoring.

Data flow notes:
- UI triggers create/update actions to the API.
- Critical state transitions (dispatch, maintenance start/close) must be executed in DB transactions to ensure atomic updates to vehicle and driver states.
- Reports are delivered from aggregated materialized views or precomputed caches to avoid heavy synchronous queries.
