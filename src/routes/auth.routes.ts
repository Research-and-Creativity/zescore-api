import { Router } from "express";
import { loginAdmin, loginParticipant } from "../controllers/auth.controller";

const router = Router();

// POST /api/v1/auth/login/admin       → login panitia/admin
router.post("/login/admin", loginAdmin);

// POST /api/v1/auth/login/participant → login tim peserta (participant mode)
router.post("/login/participant", loginParticipant);

export default router;
