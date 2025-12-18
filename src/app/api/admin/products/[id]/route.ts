import {
  adminOptions,
  adminProductDelete,
  adminProductPatch,
} from "@/controllers/admin.controller";

export const OPTIONS = adminOptions;

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return adminProductPatch(request, Number(id));
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return adminProductDelete(request, Number(id));
};



