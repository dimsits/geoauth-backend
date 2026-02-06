# GeoAuth Backend

Secure REST API for user authentication and IP geolocation lookups with per-user search history. Built with Express 5, PostgreSQL, Prisma, and JWT.

API docs (Swagger UI) are served at `http://localhost:3000/docs` when the server is running.

---

## Overview

GeoAuth provides:

- JWT-based authentication (register, login, current user)
- IP geolocation lookups (self IP or any public IP)
- Per-user search history (list, create, bulk delete)
- Swagger/OpenAPI documentation
- Prisma-backed PostgreSQL persistence

Private or reserved IPs return `null` geo data instead of throwing errors.

---

## Tech Stack

- Runtime: Node.js 18+
- Framework: Express 5.x
- Language: TypeScript 5.x
- Database: PostgreSQL
- ORM: Prisma 7.x
- Auth: JWT (jsonwebtoken)
- Password hashing: bcrypt
- External API: ipinfo.io
- API docs: Swagger UI (OpenAPI 3.0)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- ipinfo.io API token

### Setup

```bash
# Install dependencies
npm install

# Configure env
cp .env.example .env.local
# Edit .env.local with real values

# Migrate and seed
npm run prisma:migrate:dev
npm run seed

# Start dev server
npm run dev
```

Server runs at `http://localhost:3000`.

---

## Environment Variables

The server loads `.env.local` by default (see `src/server.ts`). You can also provide environment variables through your hosting platform.

| Variable | Required | Default | Notes |
|----------|----------|---------|------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | HMAC secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | Any value accepted by jsonwebtoken (e.g. `7d`, `24h`) |
| `BCRYPT_COST` | No | `12` | Range 8-15, values outside fall back to 12 |
| `IPINFO_TOKEN` | Yes | - | ipinfo.io API token |
| `CORS_ORIGIN` | Yes | - | Comma-separated allowlist (e.g. `http://localhost:5173,https://app.example.com`) |
| `PORT` | No | `3000` | Server port |

---

## Scripts

```bash
npm run dev                 # Start dev server (ts-node-dev)
npm run build               # Generate Prisma client, compile TS, copy docs
npm start                   # Run compiled server

npm run prisma              # Prisma CLI
npm run prisma:migrate:dev  # Dev migrations
npm run prisma:migrate:prod # Prod migrations
npm run seed                # Seed database
```

---

## API Summary

All `/api/geo/*` and `/api/history/*` routes require a valid `Authorization: Bearer <token>` header. `/api/me` also requires auth.

### Auth

- `POST /api/register` -> `{ token }` (201)
- `POST /api/login` -> `{ token }`
- `GET /api/me` -> `{ user: { id, email, createdAt? } }`

### Geolocation

- `GET /api/geo/self` -> `{ geo }`
- `GET /api/geo/:ip` -> `{ geo }`

`geo` is either `null` (private/reserved IP or lookup failure) or:

```json
{
  "ip": "8.8.8.8",
  "asn": "AS15169",
  "as_name": "Google LLC",
  "as_domain": "google.com",
  "country_code": "US",
  "country": "United States",
  "continent_code": "NA",
  "continent": "North America",
  "source": "ipinfo",
  "resolvedAt": "2026-02-06T12:00:00.000Z"
}
```

### History

- `POST /api/history/search` -> `{ geo }`
- `GET /api/history?limit=50` -> `{ items: [...] }`
- `DELETE /api/history` -> `{ deleted: number }`

History items:

```json
{
  "id": "uuid",
  "ip": "8.8.8.8",
  "geo": { "...": "..." },
  "createdAt": "2026-02-06T12:00:00.000Z"
}
```

---

## Error Handling

Errors are returned as JSON:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common codes:

- `INVALID_CREDENTIALS`
- `EMAIL_EXISTS`
- `INVALID_EMAIL`
- `INVALID_PASSWORD`
- `INVALID_IP`
- `INVALID_JSON`
- `UNAUTHORIZED`
- `VALIDATION_ERROR`
- `JWT_MISCONFIG`
- `INTERNAL_ERROR`

---

## Project Structure

```
geoauth-backend/
  src/
    app.ts
    server.ts
    controllers/
    services/
    repositories/
    routes/
    middleware/
    lib/
    utils/
    docs/
  prisma/
    schema.prisma
    seed.ts
  .env.example
  docker-compose.yml
  package.json
  README.md
```

---

## Deployment

1. Set production environment variables (or provide a `.env.local`).
2. Run migrations: `npm run prisma:migrate:prod`
3. Build and start:

```bash
npm run build
npm start
```

---

## License

ISC. See `LICENSE`.
