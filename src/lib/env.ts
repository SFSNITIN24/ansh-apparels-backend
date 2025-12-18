function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it locally or in Vercel.`
    );
  }
  return value.trim();
}

export const env = {
  // Comma-separated list of allowed origins for CORS (e.g. "http://localhost:5005,https://your-frontend.vercel.app")
  corsOrigins: requireEnv("CORS_ORIGINS", process.env.CORS_ORIGINS),
  // Comma-separated list of admin emails allowed to access /api/admin/*
  adminEmails: requireEnv("ADMIN_EMAILS", process.env.ADMIN_EMAILS),
  // Optional admin invite code: if set, /api/auth/signup can accept `adminCode` to create an admin.
  // Keep this secret (server-side only). If empty, invite-code promotion is disabled.
  adminInviteCode: (process.env.ADMIN_INVITE_CODE || "").trim(),
  // JWT signing secret (server-side only). Used to issue access tokens on login.
  // We validate this lazily (when issuing tokens) so `next build` can run even if JWT_SECRET
  // isn't present in the build environment.
  jwtSecret: (process.env.JWT_SECRET || "").trim(),
  // MongoDB connection
  mongodbUri: requireEnv("MONGODB_URI", process.env.MONGODB_URI),
  mongodbDbName: requireEnv("MONGODB_DB_NAME", process.env.MONGODB_DB_NAME),
};


