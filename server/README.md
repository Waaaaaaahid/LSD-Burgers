# LSD Burgers API

Express + MongoDB backend for the LSD Burgers ordering application.

## Local setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Required environment variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Health endpoint: `GET /api/health`
Database health: `GET /api/health/db`

## Render
Build command: `npm install`
Start command: `npm start`
Set the environment variables in the Render service. Render provides `PORT` automatically.
