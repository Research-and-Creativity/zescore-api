import { Request, Response } from "express";
import { prisma } from "../config/database";

type Category = "POSTER" | "PRODUCT";
const ALL_CATEGORIES: Category[] = ["POSTER", "PRODUCT"];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/kiosk/teams
// List semua tim untuk ditampilkan di grid pemilihan tim (mesin kasir publik).
// ─────────────────────────────────────────────────────────────────────────────
export const listTeamsForKiosk = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { boothNumber: "asc" },
      select: { id: true, teamName: true, boothNumber: true },
    });
    res.status(200).json(teams);
  } catch (error) {
    console.error("[kiosk/teams] ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memuat daftar tim." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/check-identity
// Body: { idNumber }
// Cek apakah NIM/NIDN valid SAJA — tanpa perlu teamId.
// Dipakai di step awal sebelum user memilih tim dari grid.
// ─────────────────────────────────────────────────────────────────────────────
export const checkIdentity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { idNumber } = req.body;

    if (!idNumber) {
      res
        .status(400)
        .json({ success: false, message: "idNumber wajib diisi." });
      return;
    }

    const cleanId = String(idNumber).trim();
    const user = await prisma.user.findUnique({ where: { id: cleanId } });

    if (!user || (user.role !== "STUDENT" && user.role !== "LECTURER")) {
      res.status(404).json({
        success: false,
        message:
          "NIM/NIDN tidak ditemukan atau tidak terdaftar sebagai penilai.",
      });
      return;
    }

    // Untuk mahasiswa: cek dulu apakah voucher (global) masih ada sisa
    if (user.role === "STUDENT") {
      const used = await prisma.assessment.findMany({
        where: { voterId: cleanId, isVoteOnly: true },
        select: { category: true },
      });
      const usedCategories = used.map((u) => u.category as Category);
      const remaining = ALL_CATEGORIES.filter(
        (c) => !usedCategories.includes(c),
      );

      if (remaining.length === 0) {
        res.status(403).json({
          success: false,
          message:
            "Kedua voucher vote Anda (Poster & Product) sudah terpakai. Terima kasih telah berpartisipasi!",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "Identitas valid.",
      data: { idNumber: cleanId, name: user.name, type: user.role },
    });
  } catch (error) {
    console.error("[kiosk/check-identity] ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Kesalahan server internal." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/check-remaining
// Body: { idNumber, teamId }
// Setelah user pilih tim dari grid, cek kategori mana yang masih bisa
// divote/dinilai untuk kombinasi evaluator + tim ini.
//
// MAHASISWA: voucher GLOBAL — kalau salah satu kategori sudah dipakai di
//            stand mana pun, kategori itu hilang dari remaining di SEMUA tim.
// DOSEN:     per-tim — remaining dihitung khusus untuk tim yang dipilih.
// ─────────────────────────────────────────────────────────────────────────────
export const checkRemaining = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { idNumber, teamId } = req.body;

    if (!idNumber || !teamId) {
      res
        .status(400)
        .json({ success: false, message: "idNumber dan teamId wajib diisi." });
      return;
    }

    const cleanId = String(idNumber).trim();
    const cleanTeamId = String(teamId).trim();

    const user = await prisma.user.findUnique({ where: { id: cleanId } });
    if (!user || (user.role !== "STUDENT" && user.role !== "LECTURER")) {
      res
        .status(404)
        .json({ success: false, message: "Identitas tidak ditemukan." });
      return;
    }

    const team = await prisma.team.findUnique({ where: { id: cleanTeamId } });
    if (!team) {
      res.status(404).json({ success: false, message: "Tim tidak ditemukan." });
      return;
    }

    let remaining: Category[];

    if (user.role === "STUDENT") {
      // GLOBAL — voucher berlaku lintas tim
      const used = await prisma.assessment.findMany({
        where: { voterId: cleanId, isVoteOnly: true },
        select: { category: true },
      });
      const usedCategories = used.map((u) => u.category as Category);
      remaining = ALL_CATEGORIES.filter((c) => !usedCategories.includes(c));

      if (remaining.length === 0) {
        res.status(200).json({
          success: true,
          data: {
            remaining: [],
            message: "Kedua voucher vote Anda sudah terpakai.",
          },
        });
        return;
      }
    } else {
      // LECTURER — per tim
      const done = await prisma.assessment.findMany({
        where: { voterId: cleanId, teamId: cleanTeamId, isVoteOnly: false },
        select: { category: true },
      });
      const doneCategories = done.map((d) => d.category as Category);
      remaining = ALL_CATEGORIES.filter((c) => !doneCategories.includes(c));

      if (remaining.length === 0) {
        res.status(200).json({
          success: true,
          data: {
            remaining: [],
            message: `Anda sudah menilai semua kategori untuk Stand ${team.boothNumber} — ${team.teamName}.`,
          },
        });
        return;
      }
    }

    res.status(200).json({ success: true, data: { remaining } });
  } catch (error) {
    console.error("[kiosk/check-remaining] ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Kesalahan server internal." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/vote-student
// Body: { evaluatorId, teamId, category: "POSTER"|"PRODUCT" }
// Voucher GLOBAL: 1 mahasiswa hanya bisa vote 1x per kategori, di stand mana pun.
// ─────────────────────────────────────────────────────────────────────────────
export const submitStudentVote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { evaluatorId, teamId, category } = req.body;

    if (!evaluatorId || !teamId || !category) {
      res
        .status(400)
        .json({ success: false, message: "Data vote tidak lengkap." });
      return;
    }

    const cat = String(category).toUpperCase() as Category;
    if (!ALL_CATEGORIES.includes(cat)) {
      res
        .status(400)
        .json({
          success: false,
          message: "Kategori harus POSTER atau PRODUCT.",
        });
      return;
    }

    const cleanVoterId = String(evaluatorId).trim();
    const cleanTeamId = String(teamId).trim();

    const student = await prisma.user.findUnique({
      where: { id: cleanVoterId },
    });
    if (!student || student.role !== "STUDENT") {
      res
        .status(403)
        .json({
          success: false,
          message: "NIM tidak valid atau bukan mahasiswa.",
        });
      return;
    }

    const team = await prisma.team.findUnique({ where: { id: cleanTeamId } });
    if (!team) {
      res
        .status(404)
        .json({ success: false, message: "Stand tidak ditemukan." });
      return;
    }

    const voucherUsed = await prisma.assessment.findFirst({
      where: { voterId: cleanVoterId, category: cat, isVoteOnly: true },
    });
    if (voucherUsed) {
      res.status(403).json({
        success: false,
        message: `Voucher vote ${cat} Anda sudah terpakai di stand lain. Anda hanya bisa vote ${cat} satu kali untuk seluruh expo.`,
      });
      return;
    }

    const newVote = await prisma.assessment.create({
      data: {
        teamId: team.id,
        voterId: student.id,
        category: cat,
        isVoteOnly: true,
        totalScore: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: `Vote ${cat} untuk ${team.teamName} berhasil disimpan!`,
      data: {
        id: newVote.id,
        teamName: team.teamName,
        boothNumber: team.boothNumber,
        category: cat,
      },
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2002") {
      res
        .status(403)
        .json({
          success: false,
          message: "Voucher vote untuk kategori ini sudah terpakai.",
        });
      return;
    }
    console.error("[kiosk/vote-student] ERROR:", error);
    res.status(500).json({ success: false, message: "Gagal menyimpan vote." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/score-lecturer
// Body: { evaluatorId, teamId, category: "POSTER"|"PRODUCT", score: 0-100 }
// Per tim — dosen yang sama tidak bisa menilai kategori yang sama dua kali
// UNTUK TIM YANG SAMA, tapi bebas menilai tim lain.
// ─────────────────────────────────────────────────────────────────────────────
export const submitLecturerScore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { evaluatorId, teamId, category, score } = req.body;

    if (!evaluatorId || !teamId || !category || score === undefined) {
      res
        .status(400)
        .json({ success: false, message: "Parameter tidak lengkap." });
      return;
    }

    const cat = String(category).toUpperCase() as Category;
    const numScore = Number(score);

    if (!ALL_CATEGORIES.includes(cat)) {
      res
        .status(400)
        .json({
          success: false,
          message: "Kategori harus POSTER atau PRODUCT.",
        });
      return;
    }
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      res
        .status(400)
        .json({ success: false, message: "Nilai harus antara 0 sampai 100." });
      return;
    }

    const cleanVoterId = String(evaluatorId).trim();
    const cleanTeamId = String(teamId).trim();

    const lecturer = await prisma.user.findUnique({
      where: { id: cleanVoterId },
    });
    if (!lecturer || lecturer.role !== "LECTURER") {
      res
        .status(403)
        .json({
          success: false,
          message: "NIDN tidak valid atau bukan dosen juri.",
        });
      return;
    }

    const team = await prisma.team.findUnique({ where: { id: cleanTeamId } });
    if (!team) {
      res
        .status(404)
        .json({ success: false, message: "Stand tidak ditemukan." });
      return;
    }

    const already = await prisma.assessment.findUnique({
      where: {
        teamId_voterId_category: {
          teamId: team.id,
          voterId: lecturer.id,
          category: cat,
        },
      },
    });
    if (already) {
      res.status(403).json({
        success: false,
        message: `Anda sudah menilai kategori ${cat} untuk Stand ${team.boothNumber} — ${team.teamName}.`,
      });
      return;
    }

    const data =
      cat === "POSTER" ? { criteria1: numScore } : { criteria2: numScore };

    const newScore = await prisma.assessment.create({
      data: {
        teamId: team.id,
        voterId: lecturer.id,
        category: cat,
        isVoteOnly: false,
        totalScore: numScore,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: `Nilai ${cat} untuk ${team.teamName} berhasil disimpan!`,
      data: {
        id: newScore.id,
        teamName: team.teamName,
        boothNumber: team.boothNumber,
        category: cat,
        score: numScore,
      },
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2002") {
      res
        .status(403)
        .json({
          success: false,
          message: "Kategori ini sudah Anda nilai untuk tim ini.",
        });
      return;
    }
    console.error("[kiosk/score-lecturer] ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan penilaian." });
  }
};
