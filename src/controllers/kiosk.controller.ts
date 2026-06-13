import { Request, Response } from "express";
import { prisma } from "../config/database";

type Category = "POSTER" | "PRODUCT";
const ALL_CATEGORIES: Category[] = ["POSTER", "PRODUCT"];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/validate-evaluator
// Body: { idNumber, teamId }
//
// MAHASISWA (voucher GLOBAL — berlaku di semua stand):
//   Setiap mahasiswa punya 2 voucher: 1x vote POSTER, 1x vote PRODUCT.
//   Begitu salah satu voucher dipakai (di stand mana pun), kategori itu
//   tidak bisa dipakai lagi di stand lain.
//   -> `remaining` = kategori yang voucher-nya belum terpakai SAMA SEKALI.
//
// DOSEN (per-tim — tidak ada batas global):
//   Dosen bisa menilai banyak tim, tapi setiap tim hanya bisa dinilai
//   1x per kategori oleh dosen yang sama.
//   -> `remaining` = kategori yang belum dinilai dosen ini UNTUK TIM INI.
// ─────────────────────────────────────────────────────────────────────────────
export const validateEvaluator = async (
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

    // Cek user ada
    const user = await prisma.user.findUnique({ where: { id: cleanId } });
    if (!user || (user.role !== "STUDENT" && user.role !== "LECTURER")) {
      res.status(404).json({
        success: false,
        message:
          "NIM/NIDN tidak ditemukan atau tidak terdaftar sebagai penilai.",
      });
      return;
    }

    // Cek tim ada
    const team = await prisma.team.findUnique({ where: { id: cleanTeamId } });
    if (!team) {
      res
        .status(404)
        .json({ success: false, message: "Stand tidak ditemukan." });
      return;
    }

    let remaining: Category[];

    if (user.role === "STUDENT") {
      // GLOBAL check — voucher berlaku di semua stand, bukan per tim
      const used = await prisma.assessment.findMany({
        where: { voterId: cleanId, isVoteOnly: true },
        select: { category: true },
      });
      const usedCategories = used.map((u) => u.category as Category);
      remaining = ALL_CATEGORIES.filter((c) => !usedCategories.includes(c));

      if (remaining.length === 0) {
        res.status(403).json({
          success: false,
          message:
            "Kedua voucher vote Anda (Poster & Product) sudah terpakai. Terima kasih telah berpartisipasi!",
        });
        return;
      }
    } else {
      // LECTURER — per tim, tidak ada batas global
      const done = await prisma.assessment.findMany({
        where: { voterId: cleanId, teamId: cleanTeamId, isVoteOnly: false },
        select: { category: true },
      });
      const doneCategories = done.map((d) => d.category as Category);
      remaining = ALL_CATEGORIES.filter((c) => !doneCategories.includes(c));

      if (remaining.length === 0) {
        res.status(403).json({
          success: false,
          message: `Anda sudah menilai semua kategori untuk Stand ${team.boothNumber} — ${team.teamName}.`,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "Verifikasi sukses.",
      data: {
        idNumber: cleanId,
        name: user.name,
        type: user.role, // STUDENT | LECTURER
        remaining, // ["POSTER","PRODUCT"] | ["POSTER"] | ["PRODUCT"]
        teamName: team.teamName,
        boothNumber: team.boothNumber,
      },
    });
  } catch (error) {
    console.error("[kiosk/validate] ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Kesalahan server internal." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/kiosk/vote-student
// Body: { evaluatorId, teamId, category: "POSTER"|"PRODUCT" }
//
// Voucher GLOBAL: 1 mahasiswa hanya bisa vote 1x per kategori,
// di stand mana pun (tidak terikat ke 1 tim tertentu).
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
      res.status(400).json({
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
      res.status(403).json({
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

    // Voucher guard — GLOBAL: cek apakah kategori ini sudah pernah
    // dipakai mahasiswa ini di stand mana pun
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
    // Race-condition fallback: kalau ada concurrent request lolos guard di atas,
    // unique index partial (lihat migration) akan menolak di level DB.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "P2002") {
      res.status(403).json({
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
//
// Per tim — dosen yang sama tidak bisa menilai kategori yang sama
// dua kali UNTUK TIM YANG SAMA, tapi bebas menilai tim lain.
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
      res.status(400).json({
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
      res.status(403).json({
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

    // Cek dosen ini belum menilai kategori ini untuk tim ini
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

    // criteria1 = nilai POSTER, criteria2 = nilai PRODUCT
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
      res.status(403).json({
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
