import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load local env file if present; in Render/prod this is harmless (it just won't find the file)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
