import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { getOpenApiSpec } from "@/lib/openapi";

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export function GET(request: Request) {
  const origin = request.headers.get("origin");
  return NextResponse.json(getOpenApiSpec(), { headers: getCorsHeaders(origin) });
}



