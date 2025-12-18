import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { requireAdmin } from "@/lib/adminAuth";
import { productsRepository } from "@/repositories/products.repository";
import { usersRepository } from "@/repositories/users.repository";
import { contactsService } from "@/services/contacts.service";
import type { Product } from "@/types/product";
import type { UserRole } from "@/types/user";
import { deleteGridFSFile, uploadImageToGridFS } from "@/lib/gridfs";

// ============================================================================
// HELPER: Wraps admin auth + CORS for all admin endpoints
// ============================================================================
type AdminAuthResult =
  | { ok: true; headers: HeadersInit }
  | { ok: false; response: NextResponse };

async function withAdminAuth(request: Request): Promise<AdminAuthResult> {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  const admin = await requireAdmin(request);

  if (!admin.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: admin.message },
        { status: admin.status, headers }
      ),
    };
  }

  return { ok: true, headers };
}

// Helper to create error JSON response with headers
function errorResponse(message: string, status: number, headers: HeadersInit) {
  return NextResponse.json({ message }, { status, headers });
}

// Helper to extract GridFS ID from image URL
function parseGridFsIdFromUrl(url: string): string | null {
  const m = url.match(/\/api\/files\/([a-f0-9]{24})$/i);
  return m?.[1] ?? null;
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================
export function adminOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

// ============================================================================
// PRODUCTS
// ============================================================================
export async function adminProductsGet(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json(
    { products: await productsRepository.findAll() },
    { headers: auth.headers }
  );
}

export async function adminProductsPost(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const slug = body?.slug?.trim();
  const price = Number(body?.price);
  const category = body?.category;
  const sizes = Array.isArray(body?.sizes) ? body.sizes : [];
  const images = Array.isArray(body?.images) ? body.images : [];

  if (!name || !slug || !Number.isFinite(price) || !["men", "women"].includes(category) || !sizes.length || !images.length) {
    return errorResponse("Invalid product data", 400, auth.headers);
  }

  try {
    const product = await productsRepository.create({
      name,
      slug,
      price,
      category,
      sizes,
      images,
    } as Omit<Product, "id">);
    return NextResponse.json({ product }, { headers: auth.headers });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed", 400, auth.headers);
  }
}

export async function adminProductPatch(request: Request, id: number) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);

  try {
    const updated = await productsRepository.update(id, {
      name: typeof body?.name === "string" ? body.name.trim() : undefined,
      slug: typeof body?.slug === "string" ? body.slug.trim() : undefined,
      price: body?.price !== undefined ? Number(body.price) : undefined,
      category: body?.category,
      sizes: Array.isArray(body?.sizes) ? body.sizes : undefined,
      images: Array.isArray(body?.images) ? body.images : undefined,
    });
    return NextResponse.json({ product: updated }, { headers: auth.headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return errorResponse(msg, msg === "Not found" ? 404 : 400, auth.headers);
  }
}

export async function adminProductDelete(request: Request, id: number) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const ok = await productsRepository.delete(id);
  if (!ok) return errorResponse("Not found", 404, auth.headers);
  return NextResponse.json({ ok: true }, { headers: auth.headers });
}

export async function adminProductsDeleteAll(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  // Delete GridFS images referenced by products first (best-effort cleanup)
  const existing = await productsRepository.findAll();
  const ids = new Set<string>();
  for (const p of existing) {
    for (const img of p.images || []) {
      const id = typeof img === "string" ? parseGridFsIdFromUrl(img.trim()) : null;
      if (id) ids.add(id);
    }
  }
  for (const id of ids) {
    await deleteGridFSFile(id);
  }

  const deleted = await productsRepository.deleteAll();
  return NextResponse.json({ ok: true, deleted }, { headers: auth.headers });
}

// ============================================================================
// USERS
// ============================================================================
export async function adminUsersGet(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const users = (await usersRepository.list()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    role: u.role,
  }));
  return NextResponse.json({ users }, { headers: auth.headers });
}

export async function adminUserRolePatch(request: Request, id: string) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const role = body?.role as UserRole | undefined;

  if (role !== "admin" && role !== "user") {
    return errorResponse("Invalid role", 400, auth.headers);
  }

  try {
    const updated = await usersRepository.setRole(id, role);
    return NextResponse.json(
      {
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          createdAt: updated.createdAt,
          role: updated.role,
        },
      },
      { headers: auth.headers }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return errorResponse(msg, msg === "Not found" ? 404 : 400, auth.headers);
  }
}

// ============================================================================
// CONTACTS
// ============================================================================
export async function adminContactsGet(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json(
    { contacts: await contactsService.list() },
    { headers: auth.headers }
  );
}

export async function adminContactsDelete(request: Request, id: string) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  const ok = await contactsService.delete(id);
  if (!ok) return errorResponse("Not found", 404, auth.headers);
  return NextResponse.json({ ok: true }, { headers: auth.headers });
}

// ============================================================================
// FILE UPLOAD
// ============================================================================
export async function adminUploadPost(request: Request) {
  const auth = await withAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("Missing file", 400, auth.headers);
    }
    if (!file.type.startsWith("image/")) {
      return errorResponse("Only image uploads are allowed", 400, auth.headers);
    }
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("Image too large (max 5MB)", 400, auth.headers);
    }

    const stored = await uploadImageToGridFS(file);
    const backendOrigin = new URL(request.url).origin;
    const url = `${backendOrigin}/api/files/${stored.id}`;

    return NextResponse.json({ url }, { headers: auth.headers });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Upload failed", 400, auth.headers);
  }
}
