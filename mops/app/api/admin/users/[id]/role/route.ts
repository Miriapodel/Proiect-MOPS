// app/api/admin/users/[id]/role/route.ts
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> } 
) {
  const { id } = await ctx.params; 

  const { role } = await req.json().catch(() => ({}));
  if (!role || !["CITIZEN", "OPERATOR", "ADMIN"].includes(role)) {
    return new Response("Invalid role", { status: 400 });
  }

  await prisma.users.update({
    where: { id },                        
    data: { role: role as Role },          
  });

  return Response.json({ ok: true });
}
