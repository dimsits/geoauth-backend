import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import type { Express } from "express";

export function setupSwagger(app: Express) {
  const filePath = path.join(__dirname, "openapi.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const spec = YAML.parse(raw);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
}
