import { adminOptions, adminUserRolePatch } from "@/controllers/admin.controller";

export const OPTIONS = adminOptions;
export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return adminUserRolePatch(request, id);
};



