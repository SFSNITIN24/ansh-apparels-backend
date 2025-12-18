import jwt from "jsonwebtoken";

import type { PublicUser } from "@/types/user";
import { env } from "@/lib/env";

type AccessTokenClaims = {
  sub: string; // user id
  email: string;
  role: "user" | "admin";
};

const ACCESS_TOKEN_EXPIRES_IN = "7d";

export function issueAccessToken(user: PublicUser): string {
  if (!env.jwtSecret) {
    throw new Error("Missing environment variable: JWT_SECRET. Set it locally or in Vercel.");
  }

  const claims: AccessTokenClaims = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(claims, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}


