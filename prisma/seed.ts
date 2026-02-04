// prisma/seed.ts
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

async function main() {
  const email = "test@geoauth.dev";
  const password = "password123";

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Seed user already exists:", email);
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  console.log("Seed user created:");
  console.log("  email:", email);
  console.log("  password:", password);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
