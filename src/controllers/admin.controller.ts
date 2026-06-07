import { Request, Response } from "express";
import { prisma } from "../config/database";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/stats
// Statistik ringkasan untuk 4 widget card di dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getStats = async (_req: Request, res: Response) => {
  // Total tim terdaftar
  const totalTeams = await prisma.team.count();

  // Total suara mahasiswa (isVoteOnly = true)
  const totalVoters = await prisma.assessment.count({
    where: { isVoteOnly: true },
  });

  // Total dosen unik yang sudah menilai (isVoteOnly = false)
  const uniqueLecturers = await prisma.assessment.groupBy({
    by: ["voterId"],
    where: { isVoteOnly: false },
  });
  const totalAssessors = uniqueLecturers.length;

  // Rata-rata totalScore dari semua penilaian dosen
  const avgResult = await prisma.assessment.aggregate({
    where: { isVoteOnly: false },
    _avg: { totalScore: true },
  });
  const avgScoreAll = parseFloat((avgResult._avg.totalScore ?? 0).toFixed(1));

  res.json({ totalTeams, totalVoters, totalAssessors, avgScoreAll });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/recap
// Rekapitulasi lengkap per tim untuk tabel & grafik
// ─────────────────────────────────────────────────────────────────────────────
export const getRecap = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    orderBy: { boothNumber: "asc" },
  });

  const recap = await Promise.all(
    teams.map(async (team) => {
      // Jumlah vote mahasiswa ke tim ini
      const totalVotes = await prisma.assessment.count({
        where: { teamId: team.id, isVoteOnly: true },
      });

      // Agregasi nilai dari dosen untuk tim ini
      const dosenStats = await prisma.assessment.aggregate({
        where: { teamId: team.id, isVoteOnly: false },
        _avg: {
          criteria1: true,
          criteria2: true,
          criteria3: true,
          totalScore: true,
        },
        _count: { id: true },
      });

      return {
        teamId: team.id,
        teamName: team.teamName,
        boothNumber: team.boothNumber,
        totalVotes,
        avgCriteria1: parseFloat((dosenStats._avg.criteria1 ?? 0).toFixed(1)),
        avgCriteria2: parseFloat((dosenStats._avg.criteria2 ?? 0).toFixed(1)),
        avgCriteria3: parseFloat((dosenStats._avg.criteria3 ?? 0).toFixed(1)),
        avgTotalScore: parseFloat((dosenStats._avg.totalScore ?? 0).toFixed(1)),
        assessorCount: dosenStats._count.id,
      };
    }),
  );

  res.json(recap);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/teams
// Daftar semua tim (untuk manajemen master data)
// ─────────────────────────────────────────────────────────────────────────────
export const getTeams = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    orderBy: { boothNumber: "asc" },
    select: {
      id: true,
      teamName: true,
      boothNumber: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.json(teams);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/users
// Daftar semua user (mahasiswa + dosen) yang terdaftar di master data
// ─────────────────────────────────────────────────────────────────────────────
export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { role: { in: ["STUDENT", "LECTURER"] } },
    orderBy: [{ role: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.json(users);
};
