import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import kioskRoutes from "./routes/kiosk.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", app: "ZeScore API" }),
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/kiosk", kioskRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ message: "Route tidak ditemukan." }),
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`⚡ ZeScore API berjalan di http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
