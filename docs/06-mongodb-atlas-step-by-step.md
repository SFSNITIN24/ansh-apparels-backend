# MongoDB Atlas (A→Z Step-by-Step)

This guide shows **every step** to create MongoDB in Atlas and connect it to the backend project: `ansh-apparels-backend`.

You will finish with:
- a MongoDB Atlas **cluster**
- a **database user** (username/password)
- **network access** configured so your app can connect
- backend `.env.local` updated (`MONGODB_URI`, `MONGODB_DB_NAME`)
- verified collections created: `users`, `sessions`, `products`, `contacts`

---

## 0) Before you start (important)
- Keep passwords secret. Never commit `.env.local` to GitHub.
- If you ever pasted a MongoDB password publicly, **rotate it** in Atlas.

---

## 1) Create Atlas project
1. Sign in to MongoDB Atlas.
2. Create (or select) a **Project** (example: `Ansh Apparels`).

Why: Projects separate environments like dev/prod.

---

## 2) Create a Cluster
1. Click **Build a Database**
2. Choose **M0 Free** (for testing) or a paid tier (for production).
3. Choose a **region** close to you (lower latency).
4. Choose a **cluster name** (any name, only a label), examples:
   - `ansh-apparels-dev`
   - `ansh-apparels-prod`
5. Click **Create** and wait until it is ready.

Notes:
- Cluster name is **not** used in env directly.
- You connect using the **connection string** that Atlas gives you later.

---

## 3) Create a Database User (username + password)
1. Left menu → **Database Access**
2. Click **Add New Database User**
3. Authentication method: **Password**
4. Set:
   - **Username**: `ansh-apparels-user` (you can choose any)
   - **Password**: generate strong password and save it
5. **Database User Privileges**:
   - For easiest setup: **Read and write to any database**
6. Click **Add User**

Production tip:
- Later, restrict permissions to only your app DB (`ansh-apparels`) instead of “any database”.

---

## 4) Allow Network Access (IP whitelist)
Atlas blocks connections unless your IP is allowed.

1. Left menu → **Network Access**
2. Click **Add IP Address**
3. Choose one:
   - **Add Current IP Address** (recommended)
   - Testing only: **Allow access from anywhere** (`0.0.0.0/0`) (not recommended for production)
4. Confirm and wait for it to apply.

If you use mobile hotspot or your IP changes, you may need to add IP again.

---

## 5) Get the connection string (Drivers)
1. Go to **Database** (Clusters page)
2. Click **Connect**
3. Choose **Drivers**
4. Copy the connection string (it looks like):

```text
mongodb+srv://<username>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority
```

Now replace:
- `<username>` with your database username (example: `ansh-apparels-user`)
- `<password>` with the password you created

### Password encoding (common issue)
If password contains special characters, it must be URL-encoded:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

If your password is simple letters/numbers, you can paste as-is.

---

## 6) Understand “admin / local / sample_mflix / ansh-apparels”
In Atlas you may see:
- `admin` and `local`: **system databases** (ignore)
- `sample_mflix`: optional sample DB
- `ansh-apparels`: your app DB (this is what we use)

Your backend env **must** use the app DB name:
- `MONGODB_DB_NAME=ansh-apparels`

---

## 7) Configure backend env (`ansh-apparels-backend/.env.local`)
Create/edit this file:
- `ansh-apparels-backend/.env.local`

Minimum required env:

```env
# CORS (frontend origin allowed to call this backend)
CORS_ORIGINS=http://localhost:5005

# Admin allowlist (comma-separated emails)
ADMIN_EMAILS=admin@example.com

# MongoDB
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/ansh-apparels?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=ansh-apparels
```

Rules:
- One variable per line
- No quotes required
- After changing env, restart backend server

---

## 8) Install dependencies + start backend
In terminal:

```bash
cd ansh-apparels-backend
npm install
npm run dev
```

Backend URL:
- `http://localhost:5006`

If backend crashes immediately, it’s usually:
- missing env vars
- wrong IP whitelist
- wrong username/password in `MONGODB_URI`

---

## 9) Verify via Swagger (recommended)
Swagger UI:
- `http://localhost:5006/api/docs`

Do this in order:

### 9.1 Signup
- `POST /api/auth/signup`
  - Use email = `admin@example.com` if you want this user to be admin.

### 9.2 Login
- `POST /api/auth/login`
  - On success, browser stores httpOnly cookie `ansh_session`

### 9.3 Check session
- `GET /api/auth/me`
  - Response includes `isAdmin`

### 9.4 Verify admin
- `GET /api/admin/verify`
  - Should return `ok: true` for admin

### 9.5 Create product (admin)
- `POST /api/admin/products`

### 9.6 Create a contact message
- `POST /api/contact`

---

## 10) Confirm data in Atlas
Atlas → **Browse Collections** → select DB `ansh-apparels`

You should see collections:
- `users`
- `sessions`
- `products`
- `contacts`

If you do not see them:
- You likely haven’t created data yet (signup/login/contact/admin create product).

---

## 11) Common errors + fixes

### Error: “IP not allowed”
Fix:
- Atlas → Network Access → add your current IP

### Error: “Authentication failed”
Fix:
- Check username/password in `MONGODB_URI`
- If password has special characters, URL-encode it
- Try rotating password in Atlas and update `.env.local`

### Error: “Cannot connect / timeout”
Fix:
- Network Access not applied yet (wait 1–2 minutes)
- Wrong cluster host (copy again from Atlas Drivers)

### Error: backend starts but no data appears
Fix:
- Make at least one write call:
  - `/api/auth/signup` then `/api/auth/login`
  - `/api/contact`
  - `/api/admin/products` (admin only)

---

## 12) Vercel backend setup (production)
In the **backend** Vercel project:
Project → Settings → Environment Variables:
- `CORS_ORIGINS` (include your deployed frontend URL)
- `ADMIN_EMAILS`
- `MONGODB_URI`
- `MONGODB_DB_NAME`

Then redeploy backend.

