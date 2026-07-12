| Layer | Technology | Purpose |
|--------|------------|---------|
| **Frontend** | React + Vite + TypeScript | Fast, type-safe frontend development and bundling |
| **Language** | TypeScript (Node.js) | Type safety across frontend and backend codebases |
| **Styling** | Tailwind CSS (utility-first) | Rapid, consistent styling with low CSS surface area |
| **UI Components** | shadcn/ui | Accessible, customizable primitives built on Tailwind |
| **Icons** | Lucide React | Lightweight SVG icon library |
| **Forms & Validation** | React Hook Form + Zod | Efficient forms with schema validation |
| **Charts** | Recharts | Dashboard analytics and visualizations |
| **Backend** | Node.js + Express (TypeScript) | REST API server and business logic |
| **ORM** | Prisma (recommended) | Type-safe DB access and migrations; works with Postgres/SQLite |
| **Database** | SQLite (`better-sqlite3`) for dev, PostgreSQL for production | Lightweight local DB for development; Postgres for scale and reliability |
| **Authentication** | JWT (access + refresh) | Token-based API authentication with RBAC enforcement |
| **File Upload** | Multer / S3-compatible storage | Handle multipart uploads and offload large files to object storage |
| **Logging & Monitoring** | Morgan + structured app logs | HTTP access logs plus application-level structured logs |
| **Environment** | dotenv / config management | Environment-driven configuration for deployments |
| **Background Jobs** | BullMQ / Redis (optional) | Scheduling and processing of async jobs (email reminders, heavy reports)
| **Deployment** | Vercel (Frontend) + Railway / Render / Fly (Backend) | Simple CI/CD for frontend and backend services |

Notes:
- Keep this file as the single source of truth for implementation choices; other docs should reference it.
- Use SQLite only for local development and testing; Prisma makes switching to Postgres straightforward for production.