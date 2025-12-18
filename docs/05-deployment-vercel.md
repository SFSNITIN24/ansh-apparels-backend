# Deploy Backend on Vercel

## Create Vercel Project
- Import the **backend** GitHub repo (`ansh-apparels-backend`)
- Framework: Next.js (auto)

## Environment variables
Add all required variables:
- `CORS_ORIGINS`
- `ADMIN_EMAILS`
- `MONGODB_URI`
- `MONGODB_DB_NAME`

## CORS
Make sure `CORS_ORIGINS` includes your frontend Vercel URL, for example:

```env
CORS_ORIGINS=https://your-frontend.vercel.app
```

## Swagger
After deploy, Swagger UI will be available at:
- `/api/docs`



