# GeoAuth Backend

A secure, production-ready REST API for user authentication and IP geolocation lookups with per-user search history. Built with Express 5, PostgreSQL, Prisma, and JWT authentication.

**Live API Documentation:** [Swagger UI](http://localhost:3000/docs) (available when server is running)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Geolocation Service](#geolocation-service)
- [Search History](#search-history)
- [Error Handling](#error-handling)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

GeoAuth is a backend service that provides secure user authentication and IP geolocation intelligence. Each user can perform IP lookups and maintain a personal search history for auditing and analytics purposes.

### Core Features

- **User Authentication**: JWT-based registration and login with bcrypt password hashing
- **IP Geolocation**: Lookup geolocation data for any public IP using ipinfo.io API
- **Self-Lookup**: Automatically detect and resolve the caller's own IP address
- **Search History**: Persistent per-user history of all geolocation lookups
- **Bulk Operations**: Efficient batch deletion of history records
- **Private IP Handling**: Graceful handling of private/reserved IPs (returns `null` instead of errors)
- **CORS Support**: Flexible cross-origin resource sharing with comma-separated allowlist
- **OpenAPI Documentation**: Interactive Swagger UI for API exploration and testing
- **Type Safety**: Full TypeScript support with strict type checking

### Key Design Principles

- **Security First**: Passwords hashed with bcrypt, JWTs signed with HMAC, no account enumeration
- **Zero Trust Model**: All sensitive routes require Bearer token authentication
- **Fail-Safe Defaults**: Network errors and private IPs return gracefully without throwing exceptions
- **Database Efficiency**: Indexed queries on userId and createdAt for fast lookups
- **Production Ready**: Comprehensive error handling, logging, and error codes

---

## Tech Stack

### Runtime & Language
- **Node.js** 18+ (modern async/await, native ES modules ready)
- **TypeScript** 5.x (strict mode enabled for type safety)

### Web Framework
- **Express** 5.x (lightweight, industry-standard Node.js framework)

### Database & ORM
- **PostgreSQL** (reliable relational database with JSON support)
- **Prisma** 7.x (modern ORM with type-safe queries and migrations)

### Authentication & Security
- **JWT** via jsonwebtoken (stateless bearer token authentication)
- **bcrypt** (battle-tested password hashing with configurable cost)

### External APIs & Utilities
- **ipinfo.io** (IP geolocation and ASN data)
- **CORS** (cross-origin request handling)
- **axios** (HTTP client for external requests)
- **dotenv** (environment variable management)

### API Documentation
- **Swagger UI** (interactive OpenAPI 3.0 documentation)

### Development Tools
- **ts-node-dev** (hot-reload TypeScript development server)
- **Prisma CLI** (database migrations and schema management)
- **cross-env** (cross-platform environment variable handling)

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 18+** - [Download](https://nodejs.org)
2. **PostgreSQL 12+** - [Download](https://www.postgresql.org/download)
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`
3. **ipinfo.io API Token** - [Sign up free](https://ipinfo.io/account)

### Installation

```bash
# Clone the repository
git clone https://github.com/dimsits/geoauth-backend.git
cd geoauth-backend

# Install dependencies
npm install

# This automatically generates Prisma client via postinstall hook
```

### Configuration

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# Required:
#   DATABASE_URL=postgresql://user:password@localhost:5432/geoauth
#   JWT_SECRET=your-long-random-secret-key
#   IPINFO_TOKEN=your-ipinfo-token
#   CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Optional (has defaults):
#   JWT_EXPIRES_IN=7d
#   BCRYPT_COST=12
#   PORT=3000
#   NODE_ENV=development
```

### Database Setup

```bash
# Run migrations to create tables
npm run prisma:migrate:dev

# Optionally seed with sample data
npm run seed
```

### Start Development Server

```bash
# Start the dev server with hot-reload
npm run dev

# Server will be available at http://localhost:3000
# Swagger UI at http://localhost:3000/docs
```

---

## Environment Configuration

The application loads configuration from environment variables. By default, it reads from `.env.local` in development mode (see [src/server.ts](src/server.ts#L1)).

### Configuration Table

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database` |
| `JWT_SECRET` | ✅ Yes | - | HMAC secret for signing JWTs. Must be a long random string (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | ❌ No | `7d` | Token expiration time. Accepts any value recognized by jsonwebtoken (e.g., `7d`, `24h`, `30m`) |
| `BCRYPT_COST` | ❌ No | `12` | Password hashing cost factor (8-15 recommended). Values outside this range fallback to 12 |
| `IPINFO_TOKEN` | ✅ Yes | - | API token from ipinfo.io. Required for geolocation lookups |
| `CORS_ORIGIN` | ✅ Yes | - | Comma-separated list of allowed origins (e.g., `http://localhost:5173,https://app.example.com`). Server-to-server requests (no Origin header) are always allowed |
| `PORT` | ❌ No | `3000` | Port to listen on |
| `NODE_ENV` | ❌ No | `development` | Set to `production` for production deployments |

### Environment Variable Example

```bash
# .env.local
DATABASE_URL=postgresql://geoauth_user:SecurePassword123@localhost:5432/geoauth_db
JWT_SECRET=your-super-secret-key-with-at-least-32-characters-minimum
JWT_EXPIRES_IN=7d
BCRYPT_COST=12
IPINFO_TOKEN=abc123def456
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
PORT=3000
NODE_ENV=development
```

---

## Project Structure

### Directory Map

```
geoauth-backend/
├── src/
│   ├── app.ts                    # Express app setup (routes, middleware, CORS)
│   ├── server.ts                 # Server entry point (port, env loading)
│   │
│   ├── config/
│   │   └── env.ts                # Environment variable validation (reserved for future use)
│   │
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts    # Register, login, get current user
│   │   ├── geo.controller.ts     # Self IP lookup, IP lookup
│   │   └── history.controller.ts # List history, create history, delete history
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts       # User authentication logic
│   │   ├── geo.service.ts        # Geolocation resolution
│   │   └── history.service.ts    # History operations
│   │
│   ├── repositories/             # Data access layer
│   │   ├── user.repo.ts          # User CRUD operations
│   │   └── history.repo.ts       # History CRUD operations
│   │
│   ├── routes/                   # Route definitions
│   │   ├── auth.routes.ts        # /api/register, /api/login, /api/me
│   │   ├── geo.routes.ts         # /api/geo/self, /api/geo/:ip
│   │   └── history.routes.ts     # /api/history/*, /api/history/search
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts    # JWT verification and user attachment
│   │   └── error.middleware.ts   # Global error handler
│   │
│   ├── lib/                      # External integrations
│   │   ├── ipinfo.ts             # ipinfo.io API client
│   │   ├── nominatim.ts          # (Reserved) Nominatim reverse geocoding
│   │   └── prisma.ts             # Prisma client singleton
│   │
│   ├── utils/                    # Utility functions
│   │   ├── ip.ts                 # IP normalization and extraction
│   │   ├── jwt.ts                # JWT signing and verification
│   │   ├── password.ts           # Password hashing and verification
│   │   └── validate.ts           # Input validation
│   │
│   ├── types/
│   │   └── express.d.ts          # Express type augmentation (req.user)
│   │
│   └── docs/
│       ├── openapi.yaml          # OpenAPI 3.0 specification
│       └── swagger.ts             # Swagger UI setup
│
├── prisma/
│   ├── schema.prisma             # Database schema definitions
│   ├── seed.ts                   # Database seeding script
│   ├── seed.js                   # Compiled seed script
│   ├── tsconfig.seed.json        # TypeScript config for seed
│   └── migrations/               # Database migration history
│       ├── 20260203064256_init/
│       └── 20260204082307_geo_nullable/
│
├── docs/
│   └── BACKEND-DOCUMENTATION.md  # Detailed backend documentation
│
├── .env.example                  # Example environment variables
├── docker-compose.yml            # Docker Compose setup
├── package.json                  # Project metadata and dependencies
├── tsconfig.json                 # TypeScript configuration
├── prisma.config.ts              # (Reserved) Prisma configuration
├── README.md                     # This file
└── LICENSE                       # ISC License
```

### Layer Architecture

The application follows a **layered architecture**:

```
┌─────────────────────────────────┐
│       HTTP Request / Swagger    │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Middleware                     │
│  (CORS, Auth, Error Handler)    │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Routes                         │
│  (URL → Controller mapping)     │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Controllers                    │
│  (HTTP parsing & responses)     │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Services                       │
│  (Business logic)               │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Repositories                   │
│  (Database access)              │
└────────────────────┬────────────┘
                     │
┌────────────────────▼────────────┐
│  Database (PostgreSQL)          │
└─────────────────────────────────┘
```

---

## Database Schema

### Data Model

The application uses PostgreSQL with Prisma ORM. Two main entities are defined:

### User Model

Represents an authenticated user account.

```prisma
model User {
  id           String          @id @default(uuid())
  email        String          @unique
  passwordHash String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  
  histories    SearchHistory[]  // One-to-many relation
  
  @@map("users")
}
```

**Fields:**
- `id` (UUID): Unique identifier, auto-generated
- `email` (String): Unique email address for login
- `passwordHash` (String): Bcrypt-hashed password
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `histories` (Relation): User's geolocation search records

**Indexes:**
- Primary index on `id` (auto-created)
- Unique constraint on `email` (for efficient lookups)

### SearchHistory Model

Represents a single IP geolocation lookup performed by a user.

```prisma
model SearchHistory {
  id        String   @id @default(uuid())
  userId    String
  ip        String
  geo       Json?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])    // For efficient history listing
  @@index([userId, ip])           // For deduplication queries
  @@map("search_histories")
}
```

**Fields:**
- `id` (UUID): Unique record identifier
- `userId` (String): Foreign key to User
- `ip` (String): The IP address that was looked up
- `geo` (JSON): The resolved geolocation data (nullable for private IPs)
- `createdAt` (DateTime): Lookup timestamp

**Relationships:**
- `user` (One-to-One): Reference to the User who performed the lookup
- Cascade delete enabled (deleting a user removes their history)

**Indexes:**
- `(userId, createdAt)`: For listing user's history in reverse chronological order
- `(userId, ip)`: For finding duplicates or filtering by IP

### Database Migrations

The project includes two migrations:

1. **20260203064256_init**: Initial schema with User and SearchHistory models
2. **20260204082307_geo_nullable**: Made `geo` field nullable to handle private IPs

Run migrations with:
```bash
npm run prisma:migrate:dev   # Development (interactive)
npm run prisma:migrate:prod  # Production (non-interactive)
```

---

## API Documentation

The API is fully documented with OpenAPI 3.0 specification. View interactive documentation at `/docs` endpoint when server is running.

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from the `/register` or `/login` endpoints and are valid for 7 days (configurable via `JWT_EXPIRES_IN`).

---

## Authentication

### Overview

GeoAuth uses **JWT (JSON Web Tokens)** for stateless authentication. Users register with email/password, receive a token, and include that token in subsequent requests.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Authentication Flow                   │
└─────────────────────────────────────────────────────────┘

1. REGISTRATION
   POST /api/register
   { email, password }
        ↓
   [passwordHash via bcrypt]
   [JWT token signed with JWT_SECRET]
        ↓
   201 { token }

2. LOGIN
   POST /api/login
   { email, password }
        ↓
   [Find user by email]
   [Verify password against hash]
   [JWT token signed with JWT_SECRET]
        ↓
   200 { token }

3. PROTECTED REQUEST
   GET /api/geo/self
   Authorization: Bearer <token>
        ↓
   [JWT middleware validates token signature]
   [Extracts user ID from token payload]
   [Attaches req.user = { id, email }]
        ↓
   200 { geo }

4. TOKEN EXPIRATION
   Token expires after JWT_EXPIRES_IN (default: 7 days)
   Expired token returns 401 Unauthorized
   User must login again to get fresh token
```

### Register Endpoint

**Request:**
```
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validations:**
- Email must be valid format (basic regex check)
- Password must be at least 8 characters
- Email must be unique (case-insensitive)

**Error Responses:**
- `400 INVALID_EMAIL`: Email format invalid
- `400 INVALID_PASSWORD`: Password too weak
- `409 EMAIL_EXISTS`: Email already registered

### Login Endpoint

**Request:**
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 INVALID_CREDENTIALS`: Email not found or password incorrect
  - Note: Same error message for both cases to prevent account enumeration

### Get Current User

**Request:**
```
GET /api/me
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2026-02-06T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Missing or invalid token

### JWT Token Structure

Signed tokens contain the following payload:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1707300000,
  "exp": 1707904800
}
```

**Fields:**
- `sub`: Subject (user ID)
- `email`: User's email
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Security Considerations

1. **Secret Management**: JWT_SECRET must be secure and never exposed
2. **HTTPS**: Always use HTTPS in production to prevent token interception
3. **Token Storage**: Store tokens securely on client (httpOnly cookie or encrypted storage)
4. **Password Hashing**: All passwords are hashed with bcrypt (cost 12 by default)
5. **Account Enumeration**: Login endpoint returns same error for "user not found" and "wrong password"

---

## Geolocation Service

### Overview

The geolocation service resolves IP addresses to geographic and ASN information using the ipinfo.io API. It handles both public and private IPs gracefully.

### Architecture

```
┌──────────────────────────────────────────┐
│      HTTP Request (IP to lookup)         │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│   Controller (geo.controller.ts)         │
│   • Parse IP from request                │
│   • Normalize IP format                  │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│   Service (geo.service.ts)               │
│   • Check if IP is private               │
│   • Call external ipinfo.io API          │
│   • Format response                      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│   IPInfo Client (lib/ipinfo.ts)          │
│   • Fetch from ipinfo.io/lite/<ip>       │
│   • Handle HTTP errors                   │
│   • Parse JSON response                  │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│   IPInfo API (external service)          │
│   Returns: geo, asn, country, etc        │
└──────────────────────────────────────────┘
```

### Self IP Lookup

Returns geolocation data for the requesting client's IP address.

**Request:**
```
GET /api/geo/self
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "geo": {
    "ip": "203.0.113.42",
    "asn": "AS12345",
    "as_name": "Example ISP Inc",
    "as_domain": "example-isp.com",
    "country_code": "US",
    "country": "United States",
    "continent_code": "NA",
    "continent": "North America",
    "source": "ipinfo",
    "resolvedAt": "2026-02-06T12:00:00.000Z"
  }
}
```

**Process:**
1. Extract client IP from request (priority: x-forwarded-for → x-real-ip → express ip)
2. Normalize IP format (remove ports, brackets, IPv6-mapped IPv4)
3. Check if private/reserved IP (returns null if true)
4. Call ipinfo.io API
5. Format and return geolocation data

### IP Address Lookup

Returns geolocation data for a specified IP address.

**Request:**
```
GET /api/geo/8.8.8.8
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "geo": {
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
}
```

**Private IP Response:**
```json
{
  "geo": null
}
```

**Private IP Ranges Handled:**
- `127.0.0.0/8` (Loopback)
- `10.0.0.0/8` (Private)
- `172.16.0.0/12` (Private)
- `192.168.0.0/16` (Private)
- `169.254.0.0/16` (Link-local)
- `::1/128` (IPv6 Loopback)
- `fc00::/7` (IPv6 Private)
- `fe80::/10` (IPv6 Link-local)
- And other reserved ranges

**IP Normalization:**
The service normalizes IP input to handle various formats:
- Removes whitespace
- Strips brackets: `[::1]` → `::1`
- Removes zone indexes: `fe80::1%eth0` → `fe80::1`
- Strips ports: `127.0.0.1:8080` → `127.0.0.1` (IPv4 only)
- Converts IPv6-mapped IPv4: `::ffff:127.0.0.1` → `127.0.0.1`

**GeoSnapshot Data Structure:**
```typescript
type GeoSnapshot = {
  ip: string;              // The IP address looked up
  asn: string | null;      // Autonomous System Number
  as_name: string | null;  // AS Organization Name
  as_domain: string | null;// AS Domain
  country_code: string | null;  // ISO 3166-1 alpha-2
  country: string | null;       // Country name
  continent_code: string | null;// Continent code
  continent: string | null;     // Continent name
  source: "ipinfo";       // Data source identifier
  resolvedAt: string;     // ISO 8601 timestamp
}
```

### Error Handling

The geolocation service is designed to fail gracefully:
- Invalid IP format → returns `null`
- Private/reserved IP → returns `null`
- API rate limit exceeded → returns `null`
- Network timeout → returns `null`
- Malformed response → returns `null`

This ensures the service never throws exceptions, allowing the application to continue functioning even during external API issues.

---

## Search History

### Overview

The history service allows users to maintain a persistent record of all their IP geolocation lookups. This enables auditing, analytics, and duplicate detection.

### Core Features

- **Automatic Recording**: Every lookup via `/api/history/search` is recorded
- **Per-User Isolation**: Each user only sees their own history
- **Snapshot Storage**: Full geolocation data is saved with each lookup
- **Bulk Operations**: Efficient deletion of multiple records
- **Timestamp Tracking**: Every record includes creation time

### Create Search History

Lookup an IP and automatically record it in the user's history.

**Request:**
```
POST /api/history/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "8.8.8.8"
}
```

**Success Response (201):**
```json
{
  "geo": {
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
}
```

**Process:**
1. Validate IP format
2. Normalize IP address
3. Resolve geolocation (may return null for private IPs)
4. Create history record in database (doesn't block response)
5. Return geo data immediately

**Note**: History persistence is non-blocking. Even if database write fails, the geo data is still returned.

### List Search History

Retrieve the current user's IP lookup history.

**Request:**
```
GET /api/history?limit=50
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "ip": "8.8.8.8",
      "geo": {
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
      },
      "createdAt": "2026-02-06T12:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "ip": "1.1.1.1",
      "geo": null,
      "createdAt": "2026-02-06T11:55:00.000Z"
    }
  ]
}
```

**Query Parameters:**
- `limit` (optional, default: 50): Maximum number of records to return
  - Valid range: 1-500

**Sorting:**
- Results are returned in reverse chronological order (newest first)
- Uses database index `(userId, createdAt)` for efficient queries

### Delete Search History

Remove one or more records from the user's history.

**Request:**
```
DELETE /api/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Success Response (200):**
```json
{
  "deleted": 2
}
```

**Process:**
1. Validate that IDs belong to current user (security: prevent cross-user deletion)
2. Delete all matching records in single query
3. Return count of deleted records

**Security:**
- Users can only delete their own records
- Attempting to delete another user's record fails silently (returns 0 deleted)

**Bulk Deletion:**
```
DELETE /api/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": []  // Empty array deletes all user's history
}
```

---

## Error Handling

### Error Response Format

All errors are returned as JSON with consistent structure:

```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": { "field": "value" }
}
```

**Response Headers:**
- Content-Type: application/json
- Appropriate HTTP status code

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `400` | Bad Request | Invalid input, missing required field |
| `401` | Unauthorized | Missing or invalid JWT token |
| `409` | Conflict | Email already exists |
| `500` | Internal Server Error | Unexpected server error |

### Error Codes

Common error codes returned by the API:

| Code | HTTP | Description | Recovery |
|------|------|-------------|----------|
| `INVALID_CREDENTIALS` | 401 | Email not found or password incorrect | Verify credentials and try again |
| `EMAIL_EXISTS` | 409 | User tried to register with existing email | Use different email or login |
| `INVALID_EMAIL` | 400 | Email format is invalid | Provide valid email (user@domain.com) |
| `INVALID_PASSWORD` | 400 | Password doesn't meet requirements | Use password ≥8 characters |
| `INVALID_IP` | 400 | IP format is invalid | Provide valid IPv4 or IPv6 address |
| `INVALID_JSON` | 400 | Request body is malformed JSON | Check JSON syntax |
| `UNAUTHORIZED` | 401 | Token is missing or invalid | Include valid Bearer token in Authorization header |
| `VALIDATION_ERROR` | 400 | Generic validation failure | Check request format and required fields |
| `JWT_MISCONFIG` | 500 | JWT_SECRET not configured | Administrator: set JWT_SECRET environment variable |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Check server logs, retry request |

### Error Response Examples

**Invalid Email Format:**
```json
{
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

**Password Too Weak:**
```json
{
  "error": "Password must be at least 8 characters",
  "code": "INVALID_PASSWORD"
}
```

**Email Already Exists:**
```json
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

**Missing Authorization Header:**
```json
{
  "error": "Unauthorized"
}
```

**Invalid Token:**
```json
{
  "error": "Unauthorized"
}
```

**Invalid IP Address:**
```json
{
  "error": "Invalid IP address format",
  "code": "INVALID_IP"
}
```

### Error Handling Architecture

```typescript
// Global error handler catches all errors
app.use(errorMiddleware);

// All route handlers use try-catch
try {
  // business logic
} catch (err) {
  next(err);  // Pass to error middleware
}

// Error middleware handles:
// 1. AppError (known errors with custom codes)
// 2. JSON parse errors
// 3. Other errors (logs and returns 500)
```

---

## Development Guide

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with local values

# 3. Start PostgreSQL
docker-compose up -d  # or use your local PostgreSQL

# 4. Run migrations
npm run prisma:migrate:dev

# 5. (Optional) Seed database
npm run seed

# 6. Start dev server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload (ts-node-dev)

# Building
npm run build            # Compile TypeScript and copy docs to dist/
npm start                # Run compiled dist/server.js

# Database
npm run prisma           # Run Prisma CLI
npm run prisma:migrate:dev    # Create and run migration (dev mode)
npm run prisma:migrate:prod   # Run migration (prod mode, non-interactive)
npm run seed             # Populate database with sample data

# Utilities
npm run copy:docs        # Copy OpenAPI spec to dist/docs
```

### Development Workflow

#### Adding a New Endpoint

1. **Define Route:**
```typescript
// src/routes/example.routes.ts
router.post("/example", authMiddleware, exampleController);
```

2. **Create Controller:**
```typescript
// src/controllers/example.controller.ts
export async function exampleController(req, res, next) {
  try {
    const result = await exampleService.doSomething(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
```

3. **Implement Service:**
```typescript
// src/services/example.service.ts
export const exampleService = {
  async doSomething(data) {
    return await exampleRepo.create(data);
  },
};
```

4. **Add Repository Method:**
```typescript
// src/repositories/example.repo.ts
export const exampleRepo = {
  async create(data) {
    return prisma.example.create({ data });
  },
};
```

5. **Update OpenAPI Documentation:**
```typescript
// src/docs/swagger.ts
// Add endpoint documentation
```

#### Database Schema Changes

1. Modify `prisma/schema.prisma`:
```prisma
model Example {
  id    String  @id @default(uuid())
  name  String
}
```

2. Create migration:
```bash
npm run prisma:migrate:dev
# Specify migration name: "add_example_model"
```

3. Migration is automatically applied to dev database

#### Type Safety

The project uses strict TypeScript:
- Enable strict mode in `tsconfig.json`
- Always type function parameters and return values
- Use Prisma-generated types for database models
- Define custom types for API contracts

```typescript
type CreateUserInput = {
  email: string;
  password: string;
};

async function createUser(input: CreateUserInput): Promise<User> {
  // implementation
}
```

### Testing (Manual)

Use Swagger UI or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Protected endpoint (replace TOKEN with actual token)
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer TOKEN"
```

### Debugging

**Enable Debug Logging:**
```bash
# Development mode logs errors to console
NODE_ENV=development npm run dev
```

**Check Database:**
```bash
# Open Prisma Studio
npm run prisma studio
```

**Inspect Requests:**
- Use browser DevTools Network tab
- Use Postman to examine request/response details
- Check application logs in terminal

### Code Style

- Use TypeScript strictly
- Follow Express conventions
- Use async/await instead of callbacks
- Handle all errors explicitly
- Add JSDoc comments for public functions
- Keep controller/service separate

---

## Deployment

### Pre-Deployment Checklist

- [ ] Environment variables configured in hosting platform
- [ ] DATABASE_URL points to production PostgreSQL
- [ ] JWT_SECRET is strong and unique
- [ ] IPINFO_TOKEN is valid
- [ ] CORS_ORIGIN includes your domain
- [ ] NODE_ENV set to `production`
- [ ] PORT configured for your environment

### Build & Deploy

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run build

# 3. Run migrations on production database
npm run prisma:migrate:prod

# 4. Start the server
npm start
```

The compiled server runs from `dist/server.js`.

### Docker Deployment

A `docker-compose.yml` is included for local PostgreSQL setup:

```bash
# Start PostgreSQL container
docker-compose up -d

# Now run migrations and start server
npm run prisma:migrate:dev
npm run dev
```

For production Docker deployment, create a Dockerfile in your repository.

### Environment Variables (Production)

Set these in your hosting platform (e.g., Vercel, Heroku, AWS):

```
DATABASE_URL=postgresql://user:password@prod-host:5432/geoauth
JWT_SECRET=<generate-secure-random-string>
IPINFO_TOKEN=<your-token>
CORS_ORIGIN=https://app.example.com,https://www.example.com
NODE_ENV=production
PORT=3000
```

### Monitoring

Monitor these in production:
- Server error logs (500 errors)
- JWT verification failures
- Database connection pool status
- ipinfo.io API quota usage
- Response times for /api/geo/* endpoints

---

## Contributing

Contributions are welcome! Please ensure:

1. Code follows project style (TypeScript strict mode)
2. All endpoints are typed and documented
3. Error cases are handled properly
4. Database queries use Prisma properly
5. Tests pass locally

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description of feature"

# Push and create pull request
git push origin feature/your-feature
```

---

## License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

ISC is a permissive open-source license with minimal restrictions. You are free to use, modify, and distribute this software.
