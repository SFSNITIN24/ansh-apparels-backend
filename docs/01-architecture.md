# Backend Architecture (ansh-apparels-backend)

## Overview
This is a Next.js project used as a **backend API** (Route Handlers only).

## Structure
- `src/app/api/*`: API route handlers (thin)
- `src/controllers/*`: request/response + CORS + validation
- `src/services/*`: business logic
- `src/repositories/*`: database access (MongoDB)
- `src/lib/*`: helpers (env, cors, cookies, mongo, auth)
- `src/types/*`: shared types

## Deployment model
Designed to deploy on Vercel as a separate project from the frontend.



