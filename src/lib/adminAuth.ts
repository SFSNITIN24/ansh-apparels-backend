import { parseCookieHeader } from "@/lib/cookies";
import { authService } from "@/services/auth.service";

export async function requireAdmin(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const sessionId = cookies["ansh_session"] || null;
  const user = await authService.me(sessionId);
  if (!user) {
    return { ok: false as const, status: 401 as const, message: "Not logged in" };
  }
  if (user.role !== "admin") {
    return { ok: false as const, status: 403 as const, message: "Not authorized" };
  }

  return { ok: true as const, user };
}


