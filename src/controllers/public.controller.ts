import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { contactsService } from "@/services/contacts.service";

// ============================================================================
// HELPER
// ============================================================================
function getCors(request: Request) {
  return getCorsHeaders(request.headers.get("origin"));
}

function errorResponse(message: string, status: number, headers: HeadersInit) {
  return NextResponse.json({ message }, { status, headers });
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================
export function publicOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCors(request) });
}

// ============================================================================
// CONTACT FORM SUBMISSION
// ============================================================================
export async function submitContactPost(request: Request) {
  const headers = getCors(request);
  const body = await request.json().catch(() => null);

  try {
    const saved = await contactsService.submit({
      name: body?.name,
      message: body?.message,
      phone: body?.phone,
      email: body?.email,
    });
    return NextResponse.json({ message: saved }, { headers });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Invalid request", 400, headers);
  }
}
