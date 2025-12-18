import crypto from "crypto";

import { sessionsRepository } from "@/repositories/sessions.repository";
import { usersRepository } from "@/repositories/users.repository";
import type { PublicUser, User } from "@/types/user";
import { env } from "@/lib/env";

function hashPassword(password: string, salt: string): string {
  const key = crypto.scryptSync(password, salt, 64);
  return key.toString("hex");
}

function makeSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function toPublicUser(u: User): PublicUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

function isBootstrapAdminEmail(email: string): boolean {
  const allowed = env.adminEmails
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export const authService = {
  async signup(input: { name: string; email: string; password: string; adminCode?: string }): Promise<PublicUser> {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password || input.password.length < 6) {
      throw new Error("Invalid signup data");
    }

    const salt = makeSalt();
    const hashed = hashPassword(input.password, salt);
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash: `${salt}:${hashed}`,
      createdAt: new Date().toISOString(),
      role:
        (env.adminInviteCode &&
          typeof input.adminCode === "string" &&
          input.adminCode.trim() === env.adminInviteCode) ||
        isBootstrapAdminEmail(email)
          ? "admin"
          : "user",
    };
    const created = await usersRepository.create(user);
    return toPublicUser(created);
  },

  async login(input: { email: string; password: string }): Promise<{ user: PublicUser; sessionId: string }> {
    const email = input.email.trim().toLowerCase();
    let user = await usersRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const [salt, stored] = user.passwordHash.split(":");
    if (!salt || !stored) throw new Error("Invalid email or password");
    const computed = hashPassword(input.password, salt);

    const ok = crypto.timingSafeEqual(Buffer.from(stored, "hex"), Buffer.from(computed, "hex"));
    if (!ok) throw new Error("Invalid email or password");

    // Bootstrap admin: if email is allowlisted, ensure role is persisted as admin.
    // This helps if the user was created before ADMIN_EMAILS was configured.
    if (isBootstrapAdminEmail(user.email) && user.role !== "admin") {
      user = await usersRepository.setRole(user.id, "admin");
    }

    const sessionId = crypto.randomUUID();
    await sessionsRepository.create(sessionId, user.id);
    return { user: toPublicUser(user), sessionId };
  },

  async me(sessionId: string | null): Promise<PublicUser | null> {
    if (!sessionId) return null;
    const userId = await sessionsRepository.getUserId(sessionId);
    if (!userId) return null;
    let user = await usersRepository.findById(userId);
    if (user && isBootstrapAdminEmail(user.email) && user.role !== "admin") {
      user = await usersRepository.setRole(user.id, "admin");
    }
    return user ? toPublicUser(user) : null;
  },

  async logout(sessionId: string | null) {
    if (sessionId) await sessionsRepository.delete(sessionId);
  },
};


