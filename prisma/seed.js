"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const prisma_1 = require("../src/lib/prisma");
const password_1 = require("../src/utils/password");
async function main() {
    const email = "test@geoauth.dev";
    const password = "password123";
    // Check if user already exists
    const existing = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existing) {
        console.log("Seed user already exists:", email);
        return;
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    await prisma_1.prisma.user.create({
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
    await prisma_1.prisma.$disconnect();
});
