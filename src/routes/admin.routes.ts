import { Router } from "express";
import {
  getStats,
  getRecap,
  getTeams,
  getUsers,
} from "../controllers/admin.controller";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Semua route admin butuh JWT valid + role ADMIN
router.use(authenticate, authorizeAdmin);

// GET /api/v1/admin/stats   → 4 angka ringkasan untuk widget card dashboard
router.get("/stats", getStats);

// GET /api/v1/admin/recap   → data tabel + grafik per tim
router.get("/recap", getRecap);

// GET /api/v1/admin/teams   → master data tim
router.get("/teams", getTeams);

// GET /api/v1/admin/users   → master data mahasiswa & dosen
router.get("/users", getUsers);

export default router;
