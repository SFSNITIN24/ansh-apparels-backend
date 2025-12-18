# MongoDB Atlas Fresh Setup (Start From ZERO)

Use this when you deleted everything and want a clean MongoDB Atlas setup for `ansh-apparels-backend`.

## 1) Create Organization + Project
1. Login to MongoDB Atlas.
2. Create **New Organization**
   - Example name: `Ansh Apparels`
3. Inside the org, create **New Project**
   - Example name: `Ansh Apparels`

## 2) Create Cluster
1. In the project, click **Build a Database**
2. Select **M0 Free** (for testing) or paid tier (production)
3. Choose **Region** close to you
4. Set cluster name (only a label)
   - Example: `ansh-apparels-dev`
5. Click **Create** and wait until cluster is ready

## 3) Create Database User (username + password)
1. Left menu → **Database Access**
2. Click **Add New Database User**
3. Authentication method: **Password**
4. Set:
   - Username: `ansh-apparels-user`
   - Password: use **Autogenerate** (recommended) and **copy/save** it
5. Privileges:
   - For quick setup: **Read and write to any database**
6. Click **Add User**

Important:
- Atlas will NOT show your password again. If lost, you must **Reset Password**.

## 4) Allow Network Access (IP Whitelist)
1. Left menu → **Network Access**
2. Click **Add IP Address**
3. Choose:
   - **Add Current IP Address** (recommended)
   - Testing only: `0.0.0.0/0` (not recommended for production)
4. Save and wait 1–2 minutes

## 5) Copy the correct Connection String (Drivers — NOT Atlas SQL)
1. Go to **Database** → select your cluster → click **Connect**
2. Choose **Drivers**
3. Copy the `mongodb+srv://...` connection string

It looks like:

```text
mongodb+srv://<username>:<password>@<cluster-host>/?appName=<clusterName>
```

## 6) Update backend env (`ansh-apparels-backend/.env.local`)
Edit/create: `ansh-apparels-backend/.env.local`

```env
# CORS (frontend origin allowed to call backend)
CORS_ORIGINS=http://localhost:5005

# Admin allowlist
ADMIN_EMAILS=admin@example.com

# MongoDB (replace USER/PASSWORD/HOST)
MONGODB_URI=mongodb+srv://ansh-apparels-user:YOUR_PASSWORD@YOUR_CLUSTER_HOST/ansh-apparels?retryWrites=true&w=majority&appName=ansh-apparels-dev
MONGODB_DB_NAME=ansh-apparels
```

Notes:
- The **cluster name is not written** in env. Only the **cluster host** from the URI matters.
- Use a real DB name like `ansh-apparels` (do NOT use the cluster name as DB).

### Password special characters
If your Mongo password contains special characters (`@ : / ? # % & + =`) you must URL-encode it.

## 7) Restart backend

```bash
cd ansh-apparels-backend
npm run dev
```

Backend URL:
- `http://localhost:5006`

## 8) Test and create first collections
Open Swagger UI:
- `http://localhost:5006/api/docs`

Run:
1. `POST /api/auth/signup`
2. `POST /api/auth/login`

Then in Atlas → **Browse Collections**, inside DB `ansh-apparels` you should see:
- `users`
- `sessions`

## 9) If you still get errors
- **bad auth**: wrong username/password OR password needs URL-encoding → reset password in **Database Access**
- **ENOTFOUND / querySrv**: wrong cluster host → re-copy URI from **Connect → Drivers**
- **IP not allowed**: add your current IP in **Network Access**



