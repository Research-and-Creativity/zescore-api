// src/routes/kiosk.routes.ts
import { Router } from 'express';
import { 
  validateEvaluator, 
  submitStudentVote, 
  submitLecturerScore 
} from '../controllers/kiosk.controller';

const router = Router();

/**
 * @route   POST /api/v1/kiosk/validate-evaluator
 * @desc    Verifikasi NIM/NIDN secara real-time dengan proteksi Opsi A Ketat
 * @access  Public (Kiosk Terminal)
 */
router.post('/validate-evaluator', validateEvaluator);

/**
 * @route   POST /api/v1/kiosk/vote-student
 * @desc    Pencatatan data vote tunggal kelompok terfavorit dari mahasiswa ke tabel Assessment
 * @access  Public (Kiosk Terminal)
 */
router.post('/vote-student', submitStudentVote);

/**
 * @route   POST /api/v1/kiosk/score-lecturer
 * @desc    Proses submit nilai multi-kategori dari juri/dosen dan kalkulasi rata-rata di server
 * @access  Public (Kiosk Terminal)
 */
router.post('/score-lecturer', submitLecturerScore);

export default router;