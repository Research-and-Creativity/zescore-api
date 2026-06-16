import { Router } from "express";
import {
  validateEvaluator,
  submitStudentVote,
  submitLecturerScore,
} from "../controllers/kiosk.controller";

const router = Router();

/**
 * POST /api/v1/kiosk/validate-evaluator
 */
router.post("/validate-evaluator", validateEvaluator);

/**
 * POST /api/v1/kiosk/vote-student
 */
router.post("/vote-student",  submitStudentVote);

/**
 * POST /api/v1/kiosk/score-lecturer
 */
router.post("/score-lecturer", submitLecturerScore);

export default router;
