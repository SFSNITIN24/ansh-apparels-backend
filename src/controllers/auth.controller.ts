import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { parseCookieHeader, serializeCookie } from "@/lib/cookies";
import { authService } from "@/services/auth.service";
import { issueAccessToken } from "@/lib/jwt";

const SESSION_COOKIE = "ansh_session";

// ============================================================================
// HELPERS
// ============================================================================
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
}

function getCors(request: Request) {
  return getCorsHeaders(request.headers.get("origin"));
}

function errorResponse(message: string, status: number, headers: HeadersInit) {
  return NextResponse.json({ message }, { status, headers });
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================
export function authOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCors(request) });
}

// ============================================================================
// SIGNUP
// ============================================================================
export async function signupPost(request: Request) {
  const headers = getCors(request);

  const body = await request.json().catch(() => null);
  const { name, email, password, adminCode } = body ?? {};

  try {
    const user = await authService.signup({ name, email, password, adminCode });
    // Signup never grants admin in response (effective only after login/me)
    return NextResponse.json({ user: { ...user, isAdmin: false } }, { headers });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Signup failed", 400, headers);
  }
}

// ============================================================================
// LOGIN
// ============================================================================
export async function loginPost(request: Request) {
  const headers = new Headers(getCors(request));

  const body = await request.json().catch(() => null);
  const { email, password } = body ?? {};

  try {
    const { user, sessionId } = await authService.login({ email, password });
    const token = issueAccessToken(user);

    headers.append(
      "Set-Cookie",
      serializeCookie({
        name: SESSION_COOKIE,
        value: sessionId,
        ...cookieOptions(),
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    return NextResponse.json(
      { user: { ...user, isAdmin: user.role === "admin" }, token },
      { headers }
    );
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Login failed", 401, headers);
  }
}

// ============================================================================
// ME (get current user)
// ============================================================================
export async function meGetAsync(request: Request) {
  const headers = getCors(request);
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE] || null;

  const user = await authService.me(sessionId);
  if (!user) {
    return errorResponse("Not logged in", 401, headers);
  }

  return NextResponse.json(
    { user: { ...user, isAdmin: user.role === "admin" } },
    { headers }
  );
}

// ============================================================================
// LOGOUT
// ============================================================================
export async function logoutPostAsync(request: Request) {
  const headers = new Headers(getCors(request));
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE] || null;

  await authService.logout(sessionId);

  headers.append(
    "Set-Cookie",
    serializeCookie({
      name: SESSION_COOKIE,
      value: "",
      ...cookieOptions(),
      maxAge: 0,
    })
  );

  return NextResponse.json({ ok: true }, { headers });
}

