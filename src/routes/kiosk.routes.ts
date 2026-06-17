import { Router } from "express";
import {
  listTeamsForKiosk,
  checkIdentity,
  checkRemaining,
  submitStudentVote,
  submitLecturerScore,
} from "../controllers/kiosk.controller";

const router = Router();

// Semua route ini PUBLIK (tanpa auth) — kiosk adalah mesin kasir bebas akses.

/**
 * GET /api/v1/kiosk/teams
 * List semua tim untuk grid pemilihan.
 */
router.get("/teams", listTeamsForKiosk);

/**
 * POST /api/v1/kiosk/check-identity
 * Validasi NIM/NIDN saja (sebelum pilih tim).
 */
router.post("/check-identity", checkIdentity);

/**
 * POST /api/v1/kiosk/check-remaining
 * Cek kategori yang masih bisa divote/dinilai untuk kombinasi evaluator+tim.
 */
router.post("/check-remaining", checkRemaining);

/**
 * POST /api/v1/kiosk/vote-student
 */
router.post("/vote-student", submitStudentVote);

/**
 * POST /api/v1/kiosk/score-lecturer
 */
router.post("/score-lecturer", submitLecturerScore);

export default router;
