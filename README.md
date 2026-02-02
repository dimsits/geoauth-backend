# GeoAuth

This project is a full-stack web application built with a clear separation between frontend, backend, database, and external services. It is designed to satisfy the internship assessment requirements while remaining simple, secure, and scalable.

---

## Tech Stack

### Frontend

* React (Vite)
* Deployed on Vercel
* Handles UI, routing, authentication state, and map rendering

### Backend

* Node.js + Express
* REST API for authentication, geolocation, and search history
* Connects to PostgreSQL via Supabase

### Database

* PostgreSQL (Supabase)
* Stores users and IP search history

### External API

* ipinfo.io Geo API
* Provides IP address geolocation data

---

## High-Level Architecture

React (Vercel)
→ HTTPS (JWT Auth)
→ Express API
→ PostgreSQL (Supabase)
→ ipinfo.io Geo API

---

## Application Flow

### 1. Application Initialization

* On app load, the frontend checks for a stored JWT token.
* If no token exists, the user is redirected to the Login page.
* If a token exists, the user is redirected to the Home page.
* Optionally, the token can be validated using a protected endpoint.

---

### 2. Authentication Flow

1. User enters email and password on the Login page.
2. Frontend sends a request to the backend:

   * POST /api/login
3. Backend:

   * Looks up the user in the database
   * Verifies the password using bcrypt
   * Issues a signed JWT token
4. Frontend stores the token and redirects the user to the Home page.

---

### 3. Home Screen – Logged-In User IP

1. Frontend requests geolocation data for the logged-in user:

   * GET /api/geo/self
2. Backend:

   * Extracts the client IP from request headers
   * Calls ipinfo.io with the extracted IP
3. Frontend displays:

   * IP address
   * City, region, country
   * Organization and timezone
   * Map with a pinned location

---

### 4. IP Address Search

1. User enters an IP address.
2. Frontend validates the IP format.
3. Frontend sends a request:

   * GET /api/geo/:ip
4. Backend:

   * Validates the IP address
   * Fetches geolocation data from ipinfo.io
   * Stores the result in the database as search history
5. Frontend updates the displayed geolocation data and map.

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

* Express API deployed on a Node-compatible hosting provider

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

