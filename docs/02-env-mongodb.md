# Backend Env + MongoDB (ansh-apparels-backend)

## Required `.env.local`
Create `ansh-apparels-backend/.env.local`:

```env
# CORS (frontend origins allowed to call this backend)
CORS_ORIGINS=http://localhost:5005

# Admin allowlist (comma-separated)
ADMIN_EMAILS=admin@example.com

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=ansh_apparels
```

## Notes
- No env var is hardcoded; missing values will throw on startup.
- On Vercel, add the same variables in backend project settings.



