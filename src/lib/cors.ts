import { env } from "@/lib/env";

export function getCorsHeaders(requestOrigin: string | null) {
  const allowed = env.corsOrigins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // With credentials=true, Access-Control-Allow-Origin must match the request Origin exactly (no '*').
  // If the origin is not allowed, omit ACAO so the browser correctly blocks the response.
  const isAllowedOrigin = !!requestOrigin && allowed.includes(requestOrigin);
  const origin = isAllowedOrigin ? requestOrigin : requestOrigin ? null : allowed[0];

  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    // Ensure caches/proxies don't reuse CORS headers across origins.
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    // Must include any custom headers sent by the frontend (e.g. axios interceptor).
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-From",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}



