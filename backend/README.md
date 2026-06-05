# Notification System Backend

This folder contains the backend scaffold for the notification system.

## Requirements
- Node.js 18+
- Docker / Docker Compose (recommended for PostgreSQL)

## Setup
1. Copy environment variables:

```bash
cd backend
copy .env.example .env
```

2. Start PostgreSQL:

```bash
docker-compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm run dev
```

## API Endpoints
- `POST /api/v1/notifications`
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/:id`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/:id`

All endpoints require `Authorization: Bearer <token>`.

## Notes
- The database is seeded automatically by `docker-compose` using `db/init.sql`.
- Use `JWT_SECRET` to sign tokens for authentication.
