import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

type SeedProduct = {
  id: number;
  price: number;
};

type SeedUser = {
  id: number;
};

async function resetDatabase() {
  await prisma.noteProduct.deleteMany();
  await prisma.note.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
}

async function seedRoles() {
  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({ data: { name: 'ROLE_ADMIN' } }),
    prisma.role.create({ data: { name: 'ROLE_USER' } }),
  ]);

  return { adminRole, userRole };
}

async function seedUsers(roleIds: { adminRoleId: number; userRoleId: number }) {
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const [admin, waiter, cashier, disabledUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@restaurant.dev',
        username: 'admin',
        password: defaultPassword,
        name: 'Atempa',
        firstLastName: 'Admin',
        secondLastName: 'Owner',
        cellphoneNumber: '+52-555-111-0101',
        lastLogin: new Date(Date.now() - 1000 * 60 * 15),
      },
    }),
    prisma.user.create({
      data: {
        email: 'waiter@restaurant.dev',
        username: 'waiter',
        password: defaultPassword,
        name: 'Mia',
        firstLastName: 'Flores',
        secondLastName: 'Hernandez',
        cellphoneNumber: '+52-555-111-0102',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
    }),
    prisma.user.create({
      data: {
        email: 'cashier@restaurant.dev',
        username: 'cashier',
        password: defaultPassword,
        name: 'Noah',
        firstLastName: 'Garcia',
        secondLastName: null,
        cellphoneNumber: '+52-555-111-0103',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    }),
    prisma.user.create({
      data: {
        email: 'disabled@restaurant.dev',
        username: 'disabled_user',
        password: defaultPassword,
        name: 'Sofia',
        firstLastName: 'Lopez',
        secondLastName: 'Ruiz',
        cellphoneNumber: '+52-555-111-0104',
        enabled: false,
        lastLogin: null,
      },
    }),
  ]);

  await prisma.userRole.createMany({
    data: [
      { userId: admin.id, roleId: roleIds.adminRoleId },
      { userId: admin.id, roleId: roleIds.userRoleId },
      { userId: waiter.id, roleId: roleIds.userRoleId },
      { userId: cashier.id, roleId: roleIds.userRoleId },
      { userId: disabledUser.id, roleId: roleIds.userRoleId },
    ],
  });

  return { admin, waiter, cashier, disabledUser };
}

async function seedCatalog() {
  const [drinks, starters, mains, desserts] = await Promise.all([
    prisma.category.create({ data: { name: 'Drinks' } }),
    prisma.category.create({ data: { name: 'Starters' } }),
    prisma.category.create({ data: { name: 'Main Courses' } }),
    prisma.category.create({ data: { name: 'Desserts' } }),
  ]);

  await prisma.product.createMany({
    data: [
      { name: 'Sparkling Water', price: 2.5, stock: 120, categoryId: drinks.id },
      { name: 'Lemonade', price: 3.25, stock: 85, categoryId: drinks.id },
      { name: 'Iced Tea', price: 3.1, stock: 70, categoryId: drinks.id },
      { name: 'Garlic Bread', price: 4.5, stock: 50, categoryId: starters.id },
      { name: 'House Salad', price: 6.75, stock: 42, categoryId: starters.id },
      { name: 'Tomato Soup', price: 5.95, stock: 38, categoryId: starters.id },
      { name: 'Grilled Salmon', price: 17.5, stock: 22, categoryId: mains.id },
      { name: 'Ribeye Steak', price: 24.9, stock: 14, categoryId: mains.id },
      { name: 'Mushroom Pasta', price: 13.8, stock: 26, categoryId: mains.id },
      { name: 'Cheesecake', price: 6.2, stock: 30, categoryId: desserts.id },
      { name: 'Chocolate Brownie', price: 5.6, stock: 28, categoryId: desserts.id },
      { name: 'Fruit Bowl', price: 4.8, stock: 34, categoryId: desserts.id },
    ],
  });
}

async function createNoteWithItems(params: {
  userId: number;
  accountId: number;
  numberNote: number;
  status: string;
  checkin: Date;
  checkout: Date | null;
  items: Array<{ productId: number; amount: number; price: number }>;
}) {
  const note = await prisma.note.create({
    data: {
      userId: params.userId,
      accountId: params.accountId,
      numberNote: params.numberNote,
      status: params.status,
      checkin: params.checkin,
      checkout: params.checkout,
    },
  });

  await prisma.noteProduct.createMany({
    data: params.items.map((item) => ({
      noteId: note.id,
      productId: item.productId,
      amount: item.amount,
      total: Number((item.amount * item.price).toFixed(2)),
    })),
  });
}

async function seedAccountsAndNotes(users: {
  admin: SeedUser;
  waiter: SeedUser;
  cashier: SeedUser;
}) {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);
  const ninetyMinutesAgo = new Date(now.getTime() - 1000 * 60 * 90);
  const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const yesterdayCheckout = new Date(now.getTime() - 1000 * 60 * 60 * 21);
  const fourHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 4);
  const threeHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 3);

  const [table12, table5Closed, takeaway] = await Promise.all([
    prisma.account.create({
      data: {
        userId: users.waiter.id,
        name: 'Table 12',
        checkin: twoHoursAgo,
        checkout: null,
      },
    }),
    prisma.account.create({
      data: {
        userId: users.admin.id,
        name: 'Table 5',
        checkin: yesterday,
        checkout: yesterdayCheckout,
      },
    }),
    prisma.account.create({
      data: {
        userId: users.cashier.id,
        name: 'Takeaway #A-104',
        checkin: fourHoursAgo,
        checkout: null,
      },
    }),
  ]);

  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true },
  });
  const productByName = new Map<string, SeedProduct>(products.map((product) => [product.name, product]));

  await createNoteWithItems({
    userId: users.waiter.id,
    accountId: table12.id,
    numberNote: 1,
    status: 'open',
    checkin: ninetyMinutesAgo,
    checkout: null,
    items: [
      {
        productId: productByName.get('Sparkling Water')!.id,
        amount: 3,
        price: productByName.get('Sparkling Water')!.price,
      },
      {
        productId: productByName.get('Mushroom Pasta')!.id,
        amount: 2,
        price: productByName.get('Mushroom Pasta')!.price,
      },
      {
        productId: productByName.get('Cheesecake')!.id,
        amount: 1,
        price: productByName.get('Cheesecake')!.price,
      },
    ],
  });

  await createNoteWithItems({
    userId: users.admin.id,
    accountId: table5Closed.id,
    numberNote: 1,
    status: 'closed',
    checkin: yesterday,
    checkout: yesterdayCheckout,
    items: [
      {
        productId: productByName.get('Ribeye Steak')!.id,
        amount: 2,
        price: productByName.get('Ribeye Steak')!.price,
      },
      {
        productId: productByName.get('House Salad')!.id,
        amount: 1,
        price: productByName.get('House Salad')!.price,
      },
      {
        productId: productByName.get('Chocolate Brownie')!.id,
        amount: 2,
        price: productByName.get('Chocolate Brownie')!.price,
      },
    ],
  });

  await createNoteWithItems({
    userId: users.cashier.id,
    accountId: takeaway.id,
    numberNote: 1,
    status: 'pending-payment',
    checkin: threeHoursAgo,
    checkout: null,
    items: [
      {
        productId: productByName.get('Lemonade')!.id,
        amount: 2,
        price: productByName.get('Lemonade')!.price,
      },
      {
        productId: productByName.get('Garlic Bread')!.id,
        amount: 1,
        price: productByName.get('Garlic Bread')!.price,
      },
      {
        productId: productByName.get('Grilled Salmon')!.id,
        amount: 1,
        price: productByName.get('Grilled Salmon')!.price,
      },
    ],
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run seed.');
  }

  await resetDatabase();
  const roles = await seedRoles();
  const users = await seedUsers({ adminRoleId: roles.adminRole.id, userRoleId: roles.userRole.id });
  await seedCatalog();
  await seedAccountsAndNotes({ admin: users.admin, waiter: users.waiter, cashier: users.cashier });

  console.log('Seed completed successfully.');
  console.log('Default login credentials:');
  console.log('- admin@restaurant.dev / Password123!');
  console.log('- waiter@restaurant.dev / Password123!');
  console.log('- cashier@restaurant.dev / Password123!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
