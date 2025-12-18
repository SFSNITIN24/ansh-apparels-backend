import {
  cartOptions,
  cartGet,
  cartAddItem,
  cartUpdateItem,
  cartClear,
} from "@/controllers/carts.controller";

export const OPTIONS = cartOptions;
export const GET = cartGet;
export const POST = cartAddItem;
export const PATCH = cartUpdateItem;
export const DELETE = cartClear;

