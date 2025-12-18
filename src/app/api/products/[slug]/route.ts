import {
  productBySlugGet,
  productsOptions,
} from "@/controllers/products.controller";

export const OPTIONS = productsOptions;
export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  return productBySlugGet(request, { slug });
};


