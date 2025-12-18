import { adminContactsDelete, adminOptions } from "@/controllers/admin.controller";

export const OPTIONS = adminOptions;
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return adminContactsDelete(request, id);
};



