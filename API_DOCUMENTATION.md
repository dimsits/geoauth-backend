# GeoAuth API — Comprehensive Documentation 🔧

Generated: 2026-02-04

This document provides a full reference for the GeoAuth backend API: endpoints, request/response shapes, environment variables, error codes, data models, and developer setup steps.

---

## Table of Contents

1. Overview 🌐
2. Quickstart & Local Development ⚙️
3. Environment Variables 🔐
4. Database & Models 🗄️
5. Authentication (JWT) 🔑
6. API Endpoints (Auth, Geo, History) ✨
   - POST /api/login
   - POST /api/register
   - GET /api/me
   - GET /api/geo/self
   - GET /api/geo/:ip
   - POST /api/history/search
   - GET /api/history
   - DELETE /api/history
7. Error Responses & Codes ❗
8. Swagger/OpenAPI & Docs 📄
9. Security Notes & Operational Tips 🔒
10. Example Requests (curl) 🧪

---

## 1) Overview 🌐

GeoAuth is a small backend that provides:

- JWT-based user authentication (register, login, me)
- IP geolocation lookups (via ipinfo.io)
- Per-user search history storage (Postgres + Prisma)

The API is RESTful and expects JSON where applicable. Many endpoints are protected with the `Authorization: Bearer <token>` header.

---

## 2) Quickstart & Local Development ⚙️

Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (or Supabase)
- npm / yarn

Local steps
1. Copy environment files and fill secrets:
   - Example: `.env.development` / `.env.production` (the app reads `.env.development` when NODE_ENV != production)
2. Install dependencies:
   - npm install
3. Run migrations and seed (development):
   - npm run prisma:migrate:dev
   - npm run seed
4. Start dev server:
   - npm run dev (uses ts-node-dev)
5. Open API docs: http://localhost:3000/docs

---

## 3) Environment Variables 🔐

Required
- DATABASE_URL — Postgres connection string
- JWT_SECRET — HMAC secret used to sign JWTs
- IPINFO_TOKEN — Token for ipinfo.io
- CORS_ORIGIN — Frontend origin allowed for CORS

Optional / Tunable
- JWT_EXPIRES_IN — e.g. `7d` (default: `7d`)
- BCRYPT_COST — bcrypt rounds (default: `12`, falls back to a sane range if invalid)
- PORT — server port (default: 3000)

Notes
- If `JWT_SECRET` is missing, middleware treats requests as unauthorized and `signJwt` throws an error.

---

## 4) Database & Models 🗄️

Prisma schema (high level):

User
- id (uuid, PK)
- email (unique)
- passwordHash
- createdAt, updatedAt

SearchHistory
- id (uuid, PK)
- userId (FK -> users.id)
- ip (string)
- geo (Json, nullable) — stored snapshot returned by the geo service
- createdAt

Indexes: userId+createdAt, userId+ip

Prisma file: `prisma/schema.prisma`

---

## 5) Authentication (JWT) 🔑

- JWTs are signed with `JWT_SECRET` and have a default expiry `7d`, configurable via `JWT_EXPIRES_IN`.
- The middleware expects `Authorization: Bearer <token>` and attaches `req.user = { id, email? }` on success.
- Tokens contain `sub` (user id) and optional `email` claim.
- Utility functions: `signJwt()` (used by login/register) and `verifyJwt()` (used by middleware).

---

## 6) API Endpoints ✨

General notes
- All request/response bodies use JSON
- Protected routes require the `Authorization` header with `Bearer` token

### POST /api/login
- Public
- Body: { email: string, password: string }
- Success: 200 { token: string }
- Errors:
  - 400 — validation (invalid body, invalid email/password format)
  - 401 — invalid credentials (code: `INVALID_CREDENTIALS`)

### POST /api/register
- Public
- Body: { email: string, password: string }
- Success: 201 { token: string } (service currently returns a token on registration)
- Errors:
  - 400 — validation
  - 409 — email already exists (code: `EMAIL_EXISTS`)

### GET /api/me
- Protected (Bearer token)
- Success: 200 { user: { id, email, createdAt? } }
- Errors:
  - 401 — unauthorized

### GET /api/geo/self
- Protected
- Returns geolocation info for the client's IP (determined from x-forwarded-for/x-real-ip/req.ip/socket)
- Success: 200 { geo: GeoSnapshot | null }
- Notes: returns `null` when IP is private or ipinfo fails (service never throws; returns null on failure)

### GET /api/geo/:ip
- Protected
- Path param: ip (string)
- Validates via `net.isIP()` after normalization
- Success: 200 { geo: GeoSnapshot | null }
- Errors:
  - 400 — invalid IP (code: `INVALID_IP`)
  - 401 — unauthorized

GeoSnapshot shape (returned by geo service)
- ip: string
- network: string | null
- city: string | null
- region: string | null
- regionCode: string | null
- country: string | null
- countryCode: string | null
- continent: string | null
- continentCode: string | null
- latitude: number | null
- longitude: number | null
- timezone: string | null
- postalCode: string | null
- source: "ipinfo"
- resolvedAt: ISO timestamp

### POST /api/history/search
- Protected
- Body: { ip: string }
- Behavior: resolves the IP via geo service, records a SearchHistory row (persist errors are ignored), returns the resolved `geo` snapshot
- Success: 200 { geo: GeoSnapshot | null }
- Errors:
  - 400 — invalid IP (code: `INVALID_IP`)
  - 401 — unauthorized

### GET /api/history
- Protected
- Query: optional `limit` (number, max 100)
- Success: 200 { items: [ { id, ip, geo, createdAt } ] }
- Returns results ordered by `createdAt` desc

### DELETE /api/history
- Protected
- Body: { ids: string[] } (UUIDs of search history rows)
- Behavior: deletes rows that belong to the current user
- Success: 200 { deleted: number } (count deleted)
- Errors:
  - 400 — invalid ids payload
  - 401 — unauthorized

---

## 7) Error Responses & Codes ❗

Common error shape: { error: string, code?: string, details?: any }

Notable codes used in the app:
- INVALID_CREDENTIALS (401)
- EMAIL_EXISTS (409)
- INVALID_EMAIL (400)
- INVALID_PASSWORD (400)
- INVALID_IP (400)
- INVALID_JSON (400)
- UNAUTHORIZED (401)
- INTERNAL_ERROR (500)
- JWT_MISCONFIG (500) — missing JWT_SECRET at runtime
- JWT_INVALID_CLAIMS (500)
- VALIDATION_ERROR (400)

The global error handler also maps Postgres unique constraint violations (SQLSTATE `23505`) to 409 with `EMAIL_EXISTS` when it detects `email` mentioned in the error detail.

---

## 8) Swagger / OpenAPI & Docs 📄

- Swagger UI is mounted at `/docs` and uses `src/docs/openapi.yaml`.
- Use the OpenAPI spec for client generation or quick inspection.

---

## 9) Security Notes & Operational Tips 🔒

- Always supply `JWT_SECRET` in production and rotate carefully.
- Set `CORS_ORIGIN` to your frontend domain(s) only.
- Configure `BCRYPT_COST` if you need to tune hashing cost.
- IP lookups are rate-limited by `ipinfo.io` — consider caching or adding server-side rate limiting for heavy usage.
- The geo service ignores private IPs and returns `null` instead of calling ipinfo.

---

## 10) Example Requests (curl) 🧪

Register

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

Get current user (requires token)

```bash
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer $TOKEN"
```

Resolve client IP

```bash
curl http://localhost:3000/api/geo/self \
  -H "Authorization: Bearer $TOKEN"
```

Resolve an IP

```bash
curl http://localhost:3000/api/geo/8.8.8.8 \
  -H "Authorization: Bearer $TOKEN"
```

Search & record history

```bash
curl -X POST http://localhost:3000/api/history/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ip":"8.8.8.8"}'
```

Fetch history

```bash
curl http://localhost:3000/api/history \
  -H "Authorization: Bearer $TOKEN"
```

Bulk delete

```bash
curl -X DELETE http://localhost:3000/api/history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ids":["uuid-1","uuid-2"]}'
```

---

## Appendix: Implementation details and notes 🔎

- IP normalization and validation live in `src/utils/ip.ts` and `src/utils/validate.ts`.
- Geo lookups are implemented in `src/lib/ipinfo.ts` and the typed normalization is in `src/services/geo.service.ts`.
- Authentication is handled in `src/services/auth.service.ts` and `src/utils/jwt.ts`.
- History persistence uses `src/repositories/history.repo.ts` and Prisma (see `prisma/schema.prisma`).
- Global error handling is implemented in `src/middleware/error.middleware.ts` (recommended to register after routes; currently present in repo).

---

If you'd like, I can:
- add example Postman / Insomnia collection for the endpoints ✅
- add missing OpenAPI paths (e.g., `POST /api/history/search` is implemented in code but not present in `openapi.yaml`) ✅
- commit the new documentation and open a PR with a single commit message

---

File: `API_DOCUMENTATION.md`

