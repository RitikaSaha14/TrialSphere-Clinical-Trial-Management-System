# TrialSphere

A full-stack clinical trial operations management platform built as a portfolio project. It uses synthetic data only and is not intended for real clinical operations or patient records.

## Tech stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, Lucide
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL, Prisma ORM
- Testing: Vitest / React Testing Library (frontend), Supertest (API starter)

## Features in this MVP
- Responsive enterprise dashboard with KPI cards and enrollment analytics
- Clinical study listing, search, status filters and study detail view
- Trial site and participant directories
- REST API with dashboard, studies, sites and participants endpoints
- Email/password authentication with bcrypt hashing and HTTP-only JWT cookies
- Role-based permissions for Admin, Study Coordinator and Investigator
- Create/update/delete APIs for studies, sites and participants (role restricted)
- Server-side pagination, search and filtering for study and participant directories
- Prisma relational schema and seed data
- Input validation, centralized error handling and environment configuration

## Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop (recommended) or PostgreSQL 15+

## Quick start

### 1. Start PostgreSQL
From the project root:
```bash
docker compose up -d
```

### 2. Configure the backend
```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```
The API runs at `http://localhost:4000`. Open the frontend and choose **Create account** for the first administrator account. Subsequent self-registered accounts receive the Investigator role; promote users to other roles directly in the database for this demo.

### 3. Start the frontend
In a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account (first user is Admin) |
| POST | `/api/auth/login` | Sign in and set secure session cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user |
| GET | `/api/dashboard/stats` | Dashboard KPIs and enrollment trend |
| GET | `/api/studies` | List studies; supports `q`, `status`, `page`, `limit` |
| PATCH/DELETE | `/api/studies/:id` | Update study / Admin-only delete |
| GET | `/api/studies/:id` | Study details |
| POST | `/api/studies` | Create a study |
| GET | `/api/sites` | List trial sites |
| POST/PATCH/DELETE | `/api/sites` and `/api/sites/:id` | Manage sites (delete Admin-only) |
| GET | `/api/participants` | List synthetic participants; supports `q`, `page`, `limit` |
| POST/PATCH/DELETE | `/api/participants` and `/api/participants/:id` | Manage participants with role checks |

## Remaining improvements before production
1. Add polished create/edit forms and detail screens for sites and participants.
2. Add user administration UI for changing roles (currently role changes are database-admin operations).
3. Add audit logs, milestone workflows and report exports.
4. Add automated unit, API and end-to-end tests.
5. Configure a strong `JWT_SECRET`, HTTPS, rate limiting and production database backups before deployment.

## Important
All names, study identifiers, sites and participant codes in the seed data are fictional. Do not enter real patient or health information. This portfolio demo is not validated for GxP, 21 CFR Part 11, HIPAA or other regulated use.
