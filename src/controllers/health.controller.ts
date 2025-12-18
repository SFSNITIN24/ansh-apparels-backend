import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";

export function healthOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export function healthGet(request: Request) {
  const origin = request.headers.get("origin");
  return NextResponse.json(
    { ok: true, service: "ansh-apparels-backend" },
    { headers: getCorsHeaders(origin) }
  );
}



