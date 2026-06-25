import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const departments = ['Bakery', 'Pastry', 'Hot Kitchen A', 'Hot Kitchen B', 'Salad', 'Housekeeping', 'Store'];
  const defaultPinHash = await bcrypt.hash('0000', 10);

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, pinHash: defaultPinHash },
    });
  }

  console.log(`Seeded super admin "${superAdmin.username}" and ${departments.length} departments.`);
  console.log(`Super admin password: ${superAdminPassword} (change via SEED_SUPER_ADMIN_PASSWORD env var, or rotate it after first login)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
