# Ansh Apparels Backend (Vercel)

This is a standalone backend deployed as a separate Vercel project.

## Local dev
```bash
cd ansh-apparels-backend
npm install
```

Create `.env.local`:
```env
# comma-separated list of allowed frontend origins
CORS_ORIGINS=http://localhost:5005

# comma-separated list of admin emails that can access /api/admin/*
ADMIN_EMAILS=admin@example.com

# Optional: invite code to create an admin via signup (server-side secret)
ADMIN_INVITE_CODE=change-me-to-a-random-secret

# JWT secret for signing access tokens (7 days expiry)
JWT_SECRET=change-me-to-a-long-random-secret

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=ansh_apparels
```

You can also copy from `env.example`:
- `ansh-apparels-backend/env.example` → `ansh-apparels-backend/.env.local`

Run:
```bash
npm run dev
```

Local URL: `http://localhost:5006`

## Endpoints
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/[slug]`

## Swagger / OpenAPI
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/docs/openapi.json`

## Docs (all flows)
- `docs/01-architecture.md`
- `docs/02-env-mongodb.md`
- `docs/03-auth-admin.md`
- `docs/04-api-swagger.md`
- `docs/05-deployment-vercel.md`
- `docs/06-mongodb-atlas-step-by-step.md`
- `docs/07-mongodb-atlas-fresh-setup.md`


