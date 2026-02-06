import express from "express";
import cors from "cors";
import { setupSwagger } from "./docs/swagger";
import AuthRoutes from "./routes/auth.routes";
import GeoRoutes from "./routes/geo.routes";
import HistoryRoutes from "./routes/history.routes";

const app = express();

// --- CORS (supports comma-separated origins in CORS_ORIGIN) ---
const rawOrigins = process.env.CORS_ORIGIN ?? "";
const allowlist = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow server-to-server / Postman / curl (no Origin header)
    if (!origin) return callback(null, true);

    if (allowlist.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.use(corsMiddleware);

// Express 5: do NOT use "*" here (it crashes path-to-regexp)
// This enables browser preflight for any route.
app.options(/.*/, corsMiddleware);

// --- Body parsing ---
app.use(express.json());

// --- Routes ---
app.use("/api", AuthRoutes);
app.use("/api/geo", GeoRoutes);
app.use("/api/history", HistoryRoutes);

// --- Swagger ---
setupSwagger(app);

export default app;
