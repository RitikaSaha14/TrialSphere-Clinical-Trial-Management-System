# TrialSphere | Clinical Trial Management Platform

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)

A full-stack portfolio application for managing clinical studies, research sites, participant enrollment, and trial operations. TrialSphere demonstrates a React + TypeScript frontend, a REST API built with Express, relational data modeling with PostgreSQL/Prisma, and secure role-based access.

> **Portfolio/demo project only.** TrialSphere uses fictional sample data and is not intended for real clinical operations or patient records. It is not validated for GxP, 21 CFR Part 11, HIPAA, or other regulated use.

## Table of contents

- [Overview](#overview)
- [UI previews](#ui-previews)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Role permissions](#role-permissions)
- [API overview](#api-overview)
- [Roadmap](#roadmap)
- [Security and data disclaimer](#security-and-data-disclaimer)

## Overview

TrialSphere is a portfolio project that demonstrates how a clinical research operations platform can organize study records, research sites, participant enrollment, and operational metrics in one interface. It includes a React/TypeScript client, an Express REST API, and a PostgreSQL database managed with Prisma.

## UI previews

### Operations dashboard
<img width="1440" height="1050" alt="dashboard" src="https://github.com/user-attachments/assets/88ab9b32-4a08-4227-98f8-c3199fa88047" />


The dashboard concept preview illustrates portfolio KPIs, enrollment progress, study-status distribution, and recently updated studies. The figures and records shown are fictional sample content.

### Authentication

<img width="1200" height="800" alt="login" src="https://github.com/user-attachments/assets/fb764fe8-ced4-4311-ab6e-36f1638349b1" />


The authentication preview illustrates the sign-in experience and account-creation entry point.


## Features

- **Authentication:** email/password registration and login, bcrypt password hashing, JWT stored in an HTTP-only cookie, logout, and current-user endpoint.
- **Role-based access:** Admin, Study Coordinator, and Investigator permissions enforced by the API.
- **Dashboard:** KPI cards, enrollment trend, study-status breakdown, and recently updated studies.
- **Study directory:** study listing, search, status filtering, pagination, and study details.
- **Site directory:** research-site listing and site management API.
- **Participant directory:** participant listing, search, pagination, and participant management API.
- **REST API:** dashboard, authentication, studies, sites, and participants endpoints.
- **Data layer:** PostgreSQL relational schema, Prisma ORM, and fictional seed data.
- **Validation and errors:** request validation with Zod and centralized API error handling.
- **Responsive layout:** desktop and mobile-friendly application shell.

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 3, custom CSS |
| Routing | React Router 7 |
| Server state / API | TanStack Query, Axios |
| Charts and icons | Recharts, Lucide React |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Authentication | JSON Web Tokens, bcryptjs, HTTP-only cookies |
| Validation | Zod |
| Local infrastructure | Docker Compose |

## Architecture

```text
trialsphere/
├── client/                 # React + TypeScript frontend
│   └── src/
│       ├── components/     # Shared UI components
│       ├── pages/          # Login, dashboard, studies, sites, participants
│       ├── api.ts          # API client and request functions
│       └── App.tsx         # Routing and application shell
├── server/                 # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma   # Relational data model
│   │   └── seed.ts         # Fictional demo records
│   └── src/
│       ├── app.ts          # Routes, middleware, validation
│       ├── auth.ts         # Authentication and authorization
│       ├── db.ts           # Prisma client
│       └── server.ts       # API entry point
├── docs/                   # Requirements, architecture, API and permissions
└── docker-compose.yml      # Local PostgreSQL service
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop (recommended), or a local PostgreSQL 15+ instance

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/trialsphere.git
cd trialsphere
```

### 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

The development database is exposed on `localhost:5432`.

### 3. Configure and start the API

```bash
cd server
```

Copy the environment template to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). Update `JWT_SECRET` to a long random value.

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The API runs at `http://localhost:4000`.

### 4. Configure and start the frontend

Open a second terminal from the project root:

```bash
cd client
```

Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). The default API URL is `http://localhost:4000`.

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Create an account

Use **Create account** on the login screen. The first registered account is assigned the **Admin** role; subsequent self-registered accounts receive the **Investigator** role. For this demo, role changes are performed by updating the `User.role` field in the database; a user-administration screen is not included yet.

## Role permissions

| Capability | Admin | Study Coordinator | Investigator |
|---|:---:|:---:|:---:|
| View dashboard and directories | ✓ | ✓ | ✓ |
| Create/update studies | ✓ | ✓ | — |
| Delete studies | ✓ | — | — |
| Create/update sites | ✓ | ✓ | — |
| Delete sites | ✓ | — | — |
| Create/update participants | ✓ | ✓ | ✓ |
| Delete participants | ✓ | ✓ | — |

Authorization is enforced on the server; hiding a frontend control alone is not treated as access control.

## API overview

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check |
| POST | `/api/auth/register` | Register an account |
| POST | `/api/auth/login` | Sign in and set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get the authenticated user |
| GET | `/api/dashboard/stats` | Dashboard metrics and enrollment trend |
| GET | `/api/studies` | List studies; supports search, status, page and limit |
| GET | `/api/studies/:id` | Get study details |
| POST | `/api/studies` | Create a study (authorized roles) |
| PATCH | `/api/studies/:id` | Update a study (authorized roles) |
| DELETE | `/api/studies/:id` | Delete a study (Admin only) |
| GET | `/api/sites` | List research sites |
| POST | `/api/sites` | Create a site (authorized roles) |
| PATCH | `/api/sites/:id` | Update a site (authorized roles) |
| DELETE | `/api/sites/:id` | Delete a site (Admin only) |
| GET | `/api/participants` | List participants; supports search, page and limit |
| POST | `/api/participants` | Create a participant (authorized roles) |
| PATCH | `/api/participants/:id` | Update a participant (authorized roles) |
| DELETE | `/api/participants/:id` | Delete a participant (authorized roles) |

See [`docs/api-documentation.md`](docs/api-documentation.md) for additional API notes.

## Useful commands

```bash
# Frontend production build
cd client && npm run build

# Frontend tests (when test files are added)
npm test

# Backend TypeScript build
cd ../server && npm run build

# Open Prisma Studio
npx prisma studio
```



