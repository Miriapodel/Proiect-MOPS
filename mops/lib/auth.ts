import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({ where: { email } });
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const hash = await bcrypt.hash(data.password, 12);
  return prisma.users.create({
    data: { ...data, password: hash },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
