# Frontend Setup (Local Development)

This guide shows how to run the TransitOps frontend locally using the recommended stack (React + Vite + TypeScript + Tailwind).

Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm (examples below use `npm`)
- Git

1. Clone the repository (if not already)

```bash
git clone <REPO_URL>
cd transitops
```

2. Create the frontend project (if a frontend folder doesn't yet exist)

If the repo already contains a `frontend/` or `web/` folder, skip this step and open that folder. To scaffold a Vite + React + TypeScript app:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
```

3. Install dependencies

Example dependencies used in this project (install adaptively if your repo already has a package.json):

```bash
npm install
# or to add recommended libraries
npm install react-router-dom react-query axios react-hook-form zod @hookform/resolvers recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
```

4. Tailwind setup

If you scaffolded with Vite, initialize Tailwind:

```bash
npx tailwindcss init -p
# Edit tailwind.config.cjs to include your `src` paths, e.g.:
# module.exports = { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] }
```

5. Environment variables

Create a `.env` file at the frontend root with at least the backend API base URL:

```
VITE_API_URL=http://localhost:4000/api
```

6. Start the dev server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

7. Common developer commands

```bash
npm run build      # build production bundle
npm run preview    # preview production build locally
npm run lint       # run linter (if configured)
npm run format     # run formatter (if configured)
```

8. Connecting to backend

- Ensure the backend is running (`VITE_API_URL` in `.env` points to it).
- The frontend should call endpoints described in `ai-context/api-spec.md`.

9. Optional: UI component library and shadcn/ui

If using `shadcn/ui`, follow their setup (Radix + Tailwind + shadcn component codegen). Install per their docs and add components into `src/components`.

10. Running with sample data

- Seed the backend database with sample vehicles, drivers, and trips (see `ai-context/example-workflow.md` and `ai-context/database.md`). Then use the frontend to exercise the flows.

Troubleshooting
- If TypeScript types fail, run `npm run build` to see type errors.
- If Tailwind styles don't appear, verify `tailwind.config` content paths and that you imported the base styles in `src/main.css`.

Notes
- The frontend expects typed APIs and JSON envelopes matching `ai-context/api-spec.md`.
- For production, build the frontend and deploy to Vercel or an S3+CDN provider.
