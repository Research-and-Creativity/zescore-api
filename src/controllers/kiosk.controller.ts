// src/controllers/kiosk.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database'; // Ambil koneksi database yang valid

export const validateEvaluator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idNumber, type } = req.body;
    if (!idNumber || !type) {
      res.status(400).json({ success: false, message: 'ID Number dan tipe penilai wajib diisi.' });
      return;
    }

    const cleanId = idNumber.trim();

    // Logika Validasi NIM/NIDN
    if (type === 'MAHASISWA') {
      if (cleanId.length !== 12) {
        res.status(400).json({ success: false, message: 'NIM harus tepat 12 digit.' });
        return;
      }

      // Cek menggunakan Prisma apakah NIM sudah ada di tabel Assessment (Implementasi Opsi A)
      const existingAssessment = await (prisma.assessment as any).findFirst({
        where: { voterId: cleanId }
      });

      if (existingAssessment) {
        res.status(403).json({ 
          success: false, 
          message: 'Akses Ditolak! NIM Anda sudah terekam memberikan suara di stan pameran lain (Opsi A Ketat).' 
        });
        return;
      }
    } else if (type === 'DOSEN') {
      if (cleanId.length !== 10) {
        res.status(400).json({ success: false, message: 'NIDN harus tepat 10 digit.' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Verifikasi sukses. Selamat datang di Kiosk Terminal.',
      data: { idNumber: cleanId, type }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server internal.', error });
  }
};

export const submitStudentVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { evaluatorId, projectId } = req.body;
    if (!evaluatorId || !projectId) {
      res.status(400).json({ success: false, message: 'Data vote tidak lengkap.' });
      return;
    }

    // Logika Submit Vote: Insert data vote mahasiswa ke database
    const newVote = await (prisma.assessment as any).create({
      data: {
        voterId: evaluatorId,
        voterType: 'MAHASISWA',
        scoreInovasi: 1,
        scoreTeknis: 1,
        scorePresentasi: 1,
        scoreAverage: 1.0,
        ...((prisma.assessment as any).fields?.projectId ? { projectId: Number(projectId) } : { projectID: Number(projectId) })
      }
    });

    res.status(201).json({ success: true, message: 'Suara voting berhasil disimpan!', data: newVote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan data vote.', error });
  }
};

export const submitLecturerScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { evaluatorId, projectId, inovasi, teknis, presentasi } = req.body;
    if (!evaluatorId || !projectId || inovasi === undefined || teknis === undefined || presentasi === undefined) {
      res.status(400).json({ success: false, message: 'Parameter penilaian tidak lengkap.' });
      return;
    }

    // Logika Submit Nilai Dosen: Menghitung rata-rata skor kategori dari dosen sebelum disimpan
    const scoreInovasi = Number(inovasi);
    const scoreTeknis = Number(teknis);
    const scorePresentasi = Number(presentasi);
    const scoreAverage = parseFloat(((scoreInovasi + scoreTeknis + scorePresentasi) / 3).toFixed(1));

    const newScore = await (prisma.assessment as any).create({
      data: {
        voterId: evaluatorId,
        voterType: 'DOSEN',
        scoreInovasi,
        scoreTeknis,
        scorePresentasi,
        scoreAverage,
        ...((prisma.assessment as any).fields?.projectId ? { projectId: Number(projectId) } : { projectID: Number(projectId) })
      }
    });

    res.status(201).json({ success: true, message: 'Penilaian dosen berhasil dikunci dan disimpan!', data: newScore });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan penilaian dosen.', error });
  }
};