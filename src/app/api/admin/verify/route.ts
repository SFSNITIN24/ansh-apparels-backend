import { NextResponse } from "next/server";

import { adminOptions } from "@/controllers/admin.controller";
import { requireAdmin } from "@/lib/adminAuth";
import { getCorsHeaders } from "@/lib/cors";

export const OPTIONS = adminOptions;

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}


