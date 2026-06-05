# Notification System Repository

This repository contains two separate folders:

- `backend/` — Node.js + Express backend with PostgreSQL persistence.
- `Frontend/` — static frontend that consumes the backend API.

## Getting started

### Backend

```powershell
cd backend
copy .env.example .env
npm install
docker-compose up -d
npm run dev
```

### Frontend

Open `Frontend/index.html` in your browser and use the login form to connect to the backend.

## Notes
- The backend API runs at `http://localhost:3000/api/v1`.
- The frontend is intentionally kept as a static app for easy separation from the backend.
