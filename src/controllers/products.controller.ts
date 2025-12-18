import { NextResponse } from "next/server";

import { getCorsHeaders } from "@/lib/cors";
import { productsService } from "@/services/products.service";

// ============================================================================
// HELPER
// ============================================================================
function getCors(request: Request) {
  return getCorsHeaders(request.headers.get("origin"));
}

// ============================================================================
// OPTIONS (CORS preflight)
// ============================================================================
export function productsOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCors(request) });
}

// ============================================================================
// LIST ALL PRODUCTS
// ============================================================================
export async function productsListGet(request: Request) {
  const products = await productsService.list();
  return NextResponse.json({ products }, { headers: getCors(request) });
}

// ============================================================================
// GET PRODUCT BY SLUG
// ============================================================================
export async function productBySlugGet(request: Request, params: { slug: string }) {
  const headers = getCors(request);
  const product = await productsService.getBySlug(params.slug);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404, headers });
  }

  return NextResponse.json({ product }, { headers });
}
