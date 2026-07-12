# TransitOps Local Fullstack Setup

This document explains how to run the minimal backend and frontend locally (Windows).

Prerequisites
- Node.js 18+ installed
- npm

Backend
1. Open a terminal and install dependencies:

```bash
cd backend
npm install
```

2. Start the backend:

```bash
npm start
# Backend runs on http://localhost:4000
```

3. Default admin credentials (seeded):
- email: admin@local
- password: password

Frontend
1. Open a second terminal and install frontend dependencies:

```bash
cd frontend
npm install
```

2. Create a `.env` file in `frontend` with the API URL (optional if backend on default):

```
VITE_API_URL=http://localhost:4000
```

3. Start the frontend dev server:

```bash
npm run dev
# Frontend will open on http://localhost:5173 (Vite default)
```

High-level notes
- Login at `/login` using the seeded admin user.
- The dashboard shows basic KPIs and a vehicle list.
- This scaffold is intentionally minimal to be easy to run and extend.
