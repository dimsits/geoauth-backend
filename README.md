# GeoAuth Backend

A secure, production-ready REST API for user authentication and IP geolocation lookups with search history tracking. Built with Express.js, PostgreSQL, and JWT authentication.

**Live Demo:** [Frontend](https://geoauth-frontend.vercel.app) | **API Docs:** `/docs` (Swagger UI)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

---

## Overview

GeoAuth is a backend service that provides:

- **JWT-based User Authentication** - Secure registration and login with bcrypt password hashing
- **IP Geolocation Lookups** - Real-time geolocation data via ipinfo.io API
- **Search History Management** - Persistent user-specific search history in PostgreSQL
- **RESTful API** - Clean, documented endpoints with Swagger/OpenAPI support
- **Role-Based Protection** - All geo and history endpoints require JWT authentication

The API is designed for simplicity, security, and scalability, making it suitable for integration with frontend applications or mobile clients.

---

## Features

✅ **User Management**
- User registration with email validation
- Secure login with JWT token generation
- User profile retrieval

✅ **IP Geolocation**
- Lookup user's own IP address and geolocation
- Search geolocation for any public IP address
- Validates IPv4 and IPv6 addresses
- Handles private/reserved IPs gracefully

✅ **Search History**
- Automatic history recording on IP searches
- Retrieve user's search history with pagination
- Bulk delete of history records
- Indexed queries for performance

✅ **Security**
- JWT authentication with configurable expiry
- Bcrypt password hashing with tunable cost
- CORS protection
- Input validation on all endpoints
- Global error handling

✅ **Developer Experience**
- Swagger UI documentation at `/docs`
- OpenAPI 3.0 specification
- TypeScript for type safety
- Prisma ORM for database interactions
- Database migrations support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js 5.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7.x |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | Bcrypt |
| **External API** | ipinfo.io |
| **API Documentation** | Swagger UI + OpenAPI 3.0 |
| **Development** | ts-node-dev, Nodemon |

---

## Architecture

### System Design

```
Frontend (React/Vercel)
    ↓ HTTPS + JWT
Express API (Node.js)
    ├─ Auth Service (JWT, Bcrypt)
    ├─ Geo Service (IP Validation, ipinfo.io)
    └─ History Service (Prisma)
    ↓
PostgreSQL Database
    ├─ Users Table
    └─ SearchHistory Table
    ↓
ipinfo.io API (External)
```

### Request Flow

1. **Client Request** → Express receives HTTP request with optional JWT token
2. **Authentication Middleware** → Validates JWT and attaches user context
3. **Route Handler** → Delegates to appropriate controller
4. **Business Logic** → Service layer processes request
5. **Data Persistence** → Repository layer interacts with Prisma
6. **Response** → JSON response with status code returned to client

### Layered Architecture

```
Routes (Express routing)
    ↓
Controllers (Request handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Prisma Client (Database)
```

---

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** database (local or remote, e.g., Supabase)
- **npm** or **yarn**
- **ipinfo.io API token** (free tier available)

### Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/dimsits/geoauth-backend.git
cd geoauth-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.development
# Edit .env.development with your database URL, JWT secret, and ipinfo token

# 4. Run migrations and seed database
npm run prisma:migrate:dev
npm run seed

# 5. Start development server
npm run dev

# 6. Open API docs
# Visit: http://localhost:3000/docs
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/dimsits/geoauth-backend.git
cd geoauth-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env.development` and `.env.production` files:

```bash
# .env.development
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/geoauth_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Password hashing
BCRYPT_COST=12

# External API
IPINFO_TOKEN="your-ipinfo-io-token"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✓ | - | `development` or `production` |
| `PORT` | ✗ | 3000 | Server port |
| `DATABASE_URL` | ✓ | - | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | - | HMAC secret for JWT signing |
| `JWT_EXPIRES_IN` | ✗ | 7d | JWT expiration time (e.g., `7d`, `24h`) |
| `BCRYPT_COST` | ✗ | 12 | Bcrypt hashing rounds (10-12 recommended) |
| `IPINFO_TOKEN` | ✓ | - | ipinfo.io API token |
| `CORS_ORIGIN` | ✓ | - | Frontend origin for CORS (e.g., `https://geoauth-frontend.vercel.app`) |

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Uses `ts-node-dev` with auto-restart on file changes. Server runs on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

Compiles TypeScript to JavaScript and runs the compiled server.

### Database Management

```bash
# Create a new migration
npm run prisma:migrate:dev

# Apply migrations in production
npm run prisma:migrate:prod

# Seed database with initial data
npm run seed

# Access Prisma Studio (visual database browser)
npm run prisma studio
```

### Docker Support

A `docker-compose.yml` is included for containerized PostgreSQL:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify database is running
docker-compose ps
```

---

## Database

### Schema Overview

**Users Table**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `passwordHash` (String, bcrypt hash)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**SearchHistory Table**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `ip` (String)
- `geo` (JSON, nullable) - Snapshot of geolocation data
- `createdAt` (DateTime)

**Indexes**
- `(userId, createdAt)` - Optimizes history retrieval
- `(userId, ip)` - Optimizes duplicate search detection

### Relationships

- **User → SearchHistory** (One-to-Many)
  - One user can have many search history records
  - Delete cascade: removing a user deletes all their history

### Prisma Schema File

See [prisma/schema.prisma](prisma/schema.prisma) for complete schema definition.

---

## API Endpoints

### Authentication Routes

#### POST /api/register

Register a new user account.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (201)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**
- `400` - Validation failed (invalid email/password format)
- `409` - Email already registered (code: `EMAIL_EXISTS`)

---

#### POST /api/login

Authenticate user and retrieve JWT token.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**
- `400` - Validation failed
- `401` - Invalid credentials (code: `INVALID_CREDENTIALS`)

---

#### GET /api/me

Retrieve current authenticated user information.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2026-02-04T10:30:00.000Z"
  }
}
```

**Errors**
- `401` - Unauthorized (code: `UNAUTHORIZED`)

---

### Geolocation Routes

#### GET /api/geo/self

Retrieve geolocation data for the client's IP address.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "geo": {
    "ip": "203.0.113.45",
    "city": "San Francisco",
    "region": "California",
    "regionCode": "CA",
    "country": "United States",
    "countryCode": "US",
    "continent": "North America",
    "continentCode": "NA",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "timezone": "America/Los_Angeles",
    "postalCode": "94102",
    "network": "AS15169 Google LLC",
    "source": "ipinfo",
    "resolvedAt": "2026-02-04T15:22:10.000Z"
  }
}
```

**Errors**
- `401` - Unauthorized
- Returns `null` for private/reserved IPs

---

#### GET /api/geo/:ip

Retrieve geolocation data for a specific IP address.

**Parameters**
- `ip` (string, path) - IPv4 or IPv6 address

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "geo": {
    "ip": "8.8.8.8",
    "city": "Mountain View",
    "region": "California",
    "regionCode": "CA",
    "country": "United States",
    "countryCode": "US",
    "continent": "North America",
    "continentCode": "NA",
    "latitude": 37.422,
    "longitude": -122.084,
    "timezone": "America/Los_Angeles",
    "postalCode": "94043",
    "network": "AS15169 Google LLC",
    "source": "ipinfo",
    "resolvedAt": "2026-02-04T15:22:10.000Z"
  }
}
```

**Errors**
- `400` - Invalid IP format (code: `INVALID_IP`)
- `401` - Unauthorized

---

### History Routes

#### POST /api/history/search

Search for an IP's geolocation and automatically save to history.

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**
```json
{
  "ip": "8.8.8.8"
}
```

**Response (200)**
```json
{
  "geo": {
    "ip": "8.8.8.8",
    "city": "Mountain View",
    "region": "California",
    "regionCode": "CA",
    "country": "United States",
    "countryCode": "US",
    "continent": "North America",
    "continentCode": "NA",
    "latitude": 37.422,
    "longitude": -122.084,
    "timezone": "America/Los_Angeles",
    "postalCode": "94043",
    "network": "AS15169 Google LLC",
    "source": "ipinfo",
    "resolvedAt": "2026-02-04T15:22:10.000Z"
  }
}
```

**Errors**
- `400` - Invalid IP format (code: `INVALID_IP`)
- `401` - Unauthorized

---

#### GET /api/history

Retrieve user's search history records.

**Headers**
```
Authorization: Bearer <token>
```

**Query Parameters**
- `limit` (number, optional) - Maximum records to return (default: 50, max: 100)

**Response (200)**
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "ip": "8.8.8.8",
      "geo": {
        "ip": "8.8.8.8",
        "city": "Mountain View",
        "region": "California",
        "country": "United States",
        "latitude": 37.422,
        "longitude": -122.084,
        "timezone": "America/Los_Angeles",
        "source": "ipinfo",
        "resolvedAt": "2026-02-04T15:22:10.000Z"
      },
      "createdAt": "2026-02-04T15:25:30.000Z"
    }
  ]
}
```

**Errors**
- `401` - Unauthorized

---

#### DELETE /api/history

Delete specific history records.

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**
```json
{
  "ids": ["660e8400-e29b-41d4-a716-446655440001", "660e8400-e29b-41d4-a716-446655440002"]
}
```

**Response (200)**
```json
{
  "deleted": 2
}
```

**Errors**
- `400` - Invalid ids payload (code: `VALIDATION_ERROR`)
- `401` - Unauthorized

---

## Authentication

### JWT Implementation

- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret:** `JWT_SECRET` environment variable
- **Expiration:** Configurable via `JWT_EXPIRES_IN` (default: 7 days)
- **Claims:** `sub` (user ID), `iat` (issued at), `exp` (expiration)

### Token Usage

Include JWT token in request headers:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/me
```

### Token Validation

- Tokens are validated on every protected endpoint
- Expired tokens return `401 Unauthorized`
- Invalid signatures return `401 Unauthorized`
- Missing tokens return `401 Unauthorized`

### Password Security

- Passwords are hashed using bcrypt with configurable cost (default: 12 rounds)
- Passwords are never stored in plain text
- Passwords are validated during login
- Password requirements: Email format validation, minimum length checking

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INVALID_EMAIL` | 400 | Email format invalid |
| `INVALID_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_IP` | 400 | IP address format invalid |
| `INVALID_JSON` | 400 | Request body JSON malformed |
| `UNAUTHORIZED` | 401 | JWT token missing or invalid |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `JWT_MISCONFIG` | 500 | JWT_SECRET not configured |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (registration successful)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

---

## Project Structure

```
geoauth-backend/
├── src/
│   ├── app.ts                      # Express app setup
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   └── env.ts                  # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts      # Auth request handlers
│   │   ├── geo.controller.ts       # Geo request handlers
│   │   └── history.controller.ts   # History request handlers
│   ├── services/
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── geo.service.ts          # Geo business logic
│   │   └── history.service.ts      # History business logic
│   ├── repositories/
│   │   ├── user.repo.ts            # User data access
│   │   └── history.repo.ts         # History data access
│   ├── routes/
│   │   ├── auth.routes.ts          # Auth endpoints
│   │   ├── geo.routes.ts           # Geo endpoints
│   │   └── history.routes.ts       # History endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT validation
│   │   └── error.middleware.ts     # Error handling
│   ├── lib/
│   │   ├── ipinfo.ts               # ipinfo.io client
│   │   └── prisma.ts               # Prisma client setup
│   ├── utils/
│   │   ├── jwt.ts                  # JWT utilities
│   │   ├── password.ts             # Password utilities
│   │   ├── ip.ts                   # IP utilities
│   │   └── validate.ts             # Validation utilities
│   ├── types/
│   │   └── express.d.ts            # Express type extensions
│   └── docs/
│       ├── openapi.yaml            # OpenAPI specification
│       └── swagger.ts              # Swagger setup
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── seed.ts                     # Database seeding
│   └── migrations/                 # Migration files
├── .env.example                    # Environment template
├── docker-compose.yml              # PostgreSQL container
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── README.md                       # This file
├── API_DOCUMENTATION.md            # API reference
└── LICENSE                         # ISC License
```

### Key Directories

- **src/** - Application source code
- **src/controllers/** - HTTP request handlers
- **src/services/** - Business logic layer
- **src/repositories/** - Data access layer (Prisma)
- **src/middleware/** - Express middleware
- **src/utils/** - Utility functions
- **src/lib/** - External service clients
- **prisma/** - Database schema and migrations

---

## Development

### Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload
npm run build            # Compile TypeScript
npm start                # Run compiled production build

# Database
npm run prisma           # Prisma CLI
npm run prisma:migrate:dev    # Create and run migrations
npm run prisma:migrate:prod   # Run migrations in production
npm run seed             # Seed database with sample data

# Testing
npm test                 # Run test suite (not yet implemented)
```

### Code Organization

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic and validation
- **Repositories** handle database operations
- **Middleware** processes requests (auth, error handling)
- **Utils** contain reusable helper functions

### Adding New Endpoints

1. Create a route in `src/routes/`
2. Create a controller in `src/controllers/`
3. Create a service in `src/services/`
4. Update `src/app.ts` to register the route
5. Add OpenAPI documentation to `src/docs/openapi.yaml`

---

## Deployment

### Deployment Options

#### Heroku
```bash
git push heroku main
```

#### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy

#### Docker
```bash
docker build -t geoauth-backend .
docker run -p 3000:3000 --env-file .env geoauth-backend
```

#### Traditional Server
```bash
npm run build
npm start
```

### Pre-deployment Checklist

- [ ] Set all required environment variables
- [ ] Configure PostgreSQL database
- [ ] Update `CORS_ORIGIN` for frontend domain
- [ ] Set secure `JWT_SECRET`
- [ ] Run database migrations: `npm run prisma:migrate:prod`
- [ ] Test API endpoints
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting if needed

---

## Security

### Best Practices

✅ **Authentication**
- JWT tokens are signed with `JWT_SECRET`
- Rotate `JWT_SECRET` in production periodically
- Store `JWT_SECRET` securely (use env vars, not git)
- Use strong expiration times (7 days default)

✅ **Password Security**
- Passwords hashed with bcrypt (12 rounds default)
- Never store plain-text passwords
- Use minimum complexity requirements
- Implement rate limiting on login attempts

✅ **API Security**
- CORS restricted to frontend domain only
- All sensitive endpoints require JWT authentication
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM

✅ **Data Protection**
- Use HTTPS/TLS in production
- Sensitive data logged minimally
- Implement rate limiting for external APIs
- Regular security audits recommended

✅ **Environment Security**
- Never commit `.env` files
- Use `.env.example` for documentation
- Rotate secrets regularly
- Use different secrets per environment

### Common Vulnerabilities Prevented

- **SQL Injection** - Prisma parameterized queries
- **XSS Attacks** - JSON responses, no HTML injection
- **CSRF** - Stateless JWT authentication
- **Brute Force** - Consider adding rate limiting
- **Weak Passwords** - Email validation, length requirements

---

## Testing

The project is ready for test integration. To add tests:

```bash
npm install --save-dev jest ts-jest @types/jest supertest
```

Then create tests in `src/__tests__/` directory and update `package.json` scripts.

---

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3000/docs
```

This provides:
- Complete API endpoint reference
- Request/response schemas
- Authentication requirements
- Try-it-out functionality
- Example requests

### OpenAPI Specification

The OpenAPI 3.0 specification is available at:
```
http://localhost:3000/docs
```

See [src/docs/openapi.yaml](src/docs/openapi.yaml) for the raw specification.

---

## Troubleshooting

### Common Issues

**Issue: "DATABASE_URL not set"**
- Verify `.env.development` or `.env.production` exists
- Ensure `DATABASE_URL` is set in environment
- Check PostgreSQL connection string format

**Issue: "JWT_SECRET not configured"**
- Set `JWT_SECRET` in environment variables
- Value must be at least 32 characters

**Issue: "Cannot connect to database"**
- Verify PostgreSQL is running
- Check connection string is valid
- Run migrations: `npm run prisma:migrate:dev`

**Issue: "ipinfo API errors"**
- Verify `IPINFO_TOKEN` is valid
- Check rate limiting (free tier has limits)
- Consider caching responses

**Issue: "401 Unauthorized on protected endpoints"**
- Verify JWT token is valid and not expired
- Check `Authorization: Bearer <token>` header format
- Ensure token was retrieved from login/register

---

## Contributing

To contribute to this project:

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or feedback:

- Open an issue on [GitHub](https://github.com/dimsits/geoauth-backend/issues)
- Check existing documentation
- Review API_DOCUMENTATION.md for detailed endpoint reference

---

## Related Projects

- **Frontend:** [geoauth-frontend](https://github.com/dimsits/geoauth-frontend) - React UI for GeoAuth
- **Infrastructure:** Uses PostgreSQL (Supabase), ipinfo.io API

---

## Changelog

### v1.0.0 (2026-02-04)
- Initial release
- User authentication with JWT
- IP geolocation lookups
- Search history management
- Swagger API documentation
- PostgreSQL database integration

---

### 5. Clear Search

* Clears the active search.
* Reverts the display back to the logged-in user’s IP geolocation.

---

### 6. Search History

#### Fetch History

* GET /api/history
* Returns all IP searches associated with the logged-in user.

#### Re-display History (Optional)

* Clicking a history item reloads and displays its geolocation data.

#### Bulk Delete (Optional)

* DELETE /api/history
* Deletes multiple selected history records.

---

## API Endpoints

### Authentication

* POST /api/login
  Authenticates a user and returns a JWT token.

### Geolocation

* GET /api/geo/self
  Returns geolocation data for the logged-in user.
* GET /api/geo/:ip
  Returns geolocation data for a specific IP address.

### History

* GET /api/history
  Returns the user’s IP search history.
* DELETE /api/history
  Deletes selected search history records.

---

## Data Models

### User

* id
* email (unique)
* passwordHash
* createdAt

### SearchHistory

* id
* userId (foreign key)
* ip
* geo (JSON)
* createdAt

---

## Security

* JWT-based authentication
* Protected API routes
* Passwords hashed with bcrypt
* CORS restricted to frontend origin
* Secrets managed via environment variables

---

## Deployment

### Frontend

* Built using Vite
* Deployed on Vercel

### Backend

* Express API deployed on a Render

### Database

* PostgreSQL hosted on Supabase

===

## Environment Variables

### Frontend

* VITE_API_BASE_URL

### Backend

* DATABASE_URL
* JWT_SECRET
* CORS_ORIGIN
* IPINFO_TOKEN

