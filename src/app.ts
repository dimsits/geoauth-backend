import express from "express";
import cors from "cors";
import { setupSwagger } from "./docs/swagger";
import AuthRoutes from "./routes/auth.routes";
import GeoRoutes from "./routes/geo.routes";
import HistoryRoutes from "./routes/history.routes";

const app = express();

const rawOrigins = process.env.CORS_ORIGIN ?? "";
const allowlist = rawOrigins
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman / curl
      if (!origin) return callback(null, true);

      if (allowlist.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Important: allow preflight
app.options("*", cors());


app.use(express.json());

app.use("/api", AuthRoutes);
app.use("/api/geo", GeoRoutes);
app.use("/api/history", HistoryRoutes);

setupSwagger(app);

export default app;
