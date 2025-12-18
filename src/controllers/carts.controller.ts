import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { parseCookieHeader } from "@/lib/cookies";
import { sessionsRepository } from "@/repositories/sessions.repository";
import { cartsService } from "@/services/carts.service";
import type { CartItem } from "@/types/cart";

const SESSION_COOKIE = "ansh_session";

// ============================================================================
// HELPERS
// ============================================================================
function getCors(request: Request) {
  return getCorsHeaders(request.headers.get("origin"));
}

function errorResponse(message: string, status: number, headers: HeadersInit) {
  return NextResponse.json({ message }, { status, headers });
}

type AuthResult =
  | { ok: true; userId: string; headers: HeadersInit }
  | { ok: false; response: NextResponse };

async function requireAuth(request: Request): Promise<AuthResult> {
  const headers = getCors(request);
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE];

  if (!sessionId) {
    return { ok: false, response: errorResponse("Not logged in", 401, headers) };
  }

  const userId = await sessionsRepository.getUserId(sessionId);
  if (!userId) {
    return { ok: false, response: errorResponse("Session expired", 401, headers) };
  }

  return { ok: true, userId, headers };
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================
export function cartOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCors(request) });
}

// ============================================================================
// GET CART
// ============================================================================
export async function cartGet(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const cart = await cartsService.getCart(auth.userId);
  return NextResponse.json({ cart }, { headers: auth.headers });
}

// ============================================================================
// ADD ITEM TO CART
// ============================================================================
export async function cartAddItem(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  
  const item: CartItem = {
    productId: Number(body?.productId) || 0,
    slug: String(body?.slug || ""),
    name: String(body?.name || ""),
    price: Number(body?.price) || 0,
    image: String(body?.image || ""),
    size: String(body?.size || ""),
    quantity: Number(body?.quantity) || 1,
  };

  if (!item.slug || !item.size) {
    return errorResponse("Missing slug or size", 400, auth.headers);
  }

  const cart = await cartsService.addItem(auth.userId, item);
  return NextResponse.json({ cart }, { headers: auth.headers });
}

// ============================================================================
// UPDATE ITEM QUANTITY
// ============================================================================
export async function cartUpdateItem(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug || "");
  const size = String(body?.size || "");
  const quantity = Number(body?.quantity);

  if (!slug || !size || !Number.isFinite(quantity)) {
    return errorResponse("Missing slug, size, or quantity", 400, auth.headers);
  }

  const cart = await cartsService.updateQuantity(auth.userId, slug, size, quantity);
  return NextResponse.json({ cart }, { headers: auth.headers });
}

// ============================================================================
// REMOVE ITEM FROM CART
// ============================================================================
export async function cartRemoveItem(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug || "");
  const size = String(body?.size || "");

  if (!slug || !size) {
    return errorResponse("Missing slug or size", 400, auth.headers);
  }

  const cart = await cartsService.removeItem(auth.userId, slug, size);
  return NextResponse.json({ cart }, { headers: auth.headers });
}

// ============================================================================
// CLEAR CART (after checkout)
// ============================================================================
export async function cartClear(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  await cartsService.clearCart(auth.userId);
  return NextResponse.json({ ok: true }, { headers: auth.headers });
}

// ============================================================================
// MERGE GUEST CART (called after login)
// ============================================================================
export async function cartMerge(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const guestItems: CartItem[] = Array.isArray(body?.items) ? body.items : [];

  const cart = await cartsService.mergeGuestCart(auth.userId, guestItems);
  return NextResponse.json({ cart }, { headers: auth.headers });
}

