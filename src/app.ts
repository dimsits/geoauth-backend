import express from "express";
import cors from "cors";
import { setupSwagger } from "./docs/swagger";
import AuthRoutes from "./routes/auth.routes";
import GeoRoutes from "./routes/geo.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api", AuthRoutes);
app.use("/api", GeoRoutes);

setupSwagger(app);

export default app;
