import { PrismaClient, Role } from '../app/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    return;
  }

  const hashedPassword = await hash(adminPassword, 10);

  const admin = await prisma.users.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      firstName: 'System',
      lastName: 'Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin user ensured: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });