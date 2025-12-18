import { adminOptions, adminProductsDeleteAll, adminProductsGet, adminProductsPost } from "@/controllers/admin.controller";

export const OPTIONS = adminOptions;
export const GET = adminProductsGet;
export const POST = adminProductsPost;
export const DELETE = adminProductsDeleteAll;



