# Auth + Admin Security (Backend)

## Auth (cookie session)
- Login sets an **httpOnly** cookie: `ansh_session`
- Session is stored in Mongo `sessions` collection
- User records stored in Mongo `users` collection (email is unique)

Endpoints:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (returns user + `isAdmin`)
- `POST /api/auth/logout`

## Admin allowlist
Admin access is stored in DB as a **role** on the user record:
- `role: "user" | "admin"`

## Create admin (bootstrap)
You have two safe options:

### Option A (Invite code in signup)
1. Set server env:

```env
ADMIN_INVITE_CODE=your-secret-code
```

2. Call signup with `adminCode`:

```json
{
  "name": "Admin",
  "email": "admin@gmail.com",
  "password": "123456",
  "adminCode": "your-secret-code"
}
```

This creates the user in DB with `role="admin"`.

### Option B (Email allowlist)
To bootstrap the **first admin**, the backend will set (or auto-upgrade) `role="admin"` if the email matches an env allowlist:

```env
ADMIN_EMAILS=admin@example.com,other@example.com
```

After you have one admin, you can promote/demote users using the admin API:
- `PATCH /api/admin/users/{id}` with body `{ "role": "admin" }` or `{ "role": "user" }`

## Admin verification endpoint
- `GET /api/admin/verify`
  - `200` if logged-in admin
  - `401` if not logged in
  - `403` if logged in but not allowlisted

All `/api/admin/*` endpoints are protected by this check.


