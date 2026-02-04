import express from "express";
import cors from "cors";
import { setupSwagger } from "./docs/swagger";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

setupSwagger(app);

export default app;
