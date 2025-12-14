import { getCurrentUser, type CurrentUser } from "./currentUser";
import { forbidden, unauthorized } from "./errors";
import { Role } from "@/app/generated/prisma";

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw unauthorized("Authentication required");
  }

  if (user.role !== Role.ADMIN) {
    throw forbidden("Admin access required");
  }

  return user;
}
