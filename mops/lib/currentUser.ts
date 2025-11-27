import { cookies } from "next/headers";
import { verifySession } from "./cookies";
import { prisma } from "./prisma";
import { Role } from "@/app/generated/prisma";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
} | null;

export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { uid } = await verifySession(token);
    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}
