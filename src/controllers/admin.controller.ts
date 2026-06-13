import { Request, Response } from "express";
import { prisma } from "../config/database";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/stats
// ─────────────────────────────────────────────────────────────────────────────
export const getStats = async (_req: Request, res: Response) => {
  const totalTeams = await prisma.team.count();
  const totalVoters = await prisma.assessment.count({
    where: { isVoteOnly: true },
  });
  const uniqueLecturers = await prisma.assessment.groupBy({
    by: ["voterId"],
    where: { isVoteOnly: false },
  });
  const totalAssessors = uniqueLecturers.length;
  const avgResult = await prisma.assessment.aggregate({
    where: { isVoteOnly: false },
    _avg: { totalScore: true },
  });
  const avgScoreAll = parseFloat((avgResult._avg.totalScore ?? 0).toFixed(1));
  res.json({ totalTeams, totalVoters, totalAssessors, avgScoreAll });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/recap
// ─────────────────────────────────────────────────────────────────────────────
export const getRecap = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany({ orderBy: { boothNumber: "asc" } });

  const recap = await Promise.all(
    teams.map(async (team) => {
      // Total vote mahasiswa (isVoteOnly = true, semua kategori)
      const totalVotes = await prisma.assessment.count({
        where: { teamId: team.id, isVoteOnly: true },
      });

      // Jumlah dosen unik yang sudah menilai (minimal 1 kategori)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allDosenAssessments = await (prisma.assessment as any).findMany({
        where: { teamId: team.id, isVoteOnly: false },
        select: { voterId: true, category: true, totalScore: true },
      });

      // Pisahkan per kategori
      const posterScores: number[] = [];
      const productScores: number[] = [];
      const uniqueAssessors = new Set<string>();

      for (const a of allDosenAssessments) {
        uniqueAssessors.add(a.voterId);
        if (a.category === "POSTER") posterScores.push(a.totalScore ?? 0);
        if (a.category === "PRODUCT") productScores.push(a.totalScore ?? 0);
      }

      const avg = (arr: number[]) =>
        arr.length === 0
          ? 0
          : parseFloat(
              (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1),
            );

      const avgPoster = avg(posterScores);
      const avgProduct = avg(productScores);

      // Nilai akhir = rata-rata poster dan product (kalau salah satu kosong, pakai yang ada)
      const filled = [avgPoster, avgProduct].filter((v) => v > 0);
      const avgFinal =
        filled.length === 0
          ? 0
          : parseFloat(
              (filled.reduce((s, v) => s + v, 0) / filled.length).toFixed(1),
            );

      return {
        teamId: team.id,
        teamName: team.teamName,
        boothNumber: team.boothNumber,
        totalVotes,
        assessorCount: uniqueAssessors.size,
        avgPoster,
        avgProduct,
        avgTotalScore: avgFinal,
      };
    }),
  );

  // Sort by avgTotalScore desc
  recap.sort((a, b) => b.avgTotalScore - a.avgTotalScore);
  res.json(recap);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/scores/bar
// Data untuk bar chart — nilai rata-rata & vote per tim
// ─────────────────────────────────────────────────────────────────────────────
export const getBarScores = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany({ orderBy: { boothNumber: "asc" } });

  const result = await Promise.all(
    teams.map(async (team) => {
      const votes = await prisma.assessment.count({
        where: { teamId: team.id, isVoteOnly: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dosenAssessments = await (prisma.assessment as any).findMany({
        where: { teamId: team.id, isVoteOnly: false },
        select: { totalScore: true },
      });

      const scores = dosenAssessments.map(
        (a: { totalScore: number }) => a.totalScore ?? 0,
      );
      const avgScore =
        scores.length === 0
          ? 0
          : parseFloat(
              (
                scores.reduce((s: number, v: number) => s + v, 0) /
                scores.length
              ).toFixed(1),
            );

      return {
        name: team.boothNumber,
        score: avgScore,
        votes,
      };
    }),
  );

  res.json(result);
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS CRUD
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/teams
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

// POST /api/v1/admin/teams
export const createTeam = async (req: Request, res: Response) => {
  const { teamName, boothNumber, password } = req.body;
  if (!teamName || !boothNumber || !password) {
    res
      .status(400)
      .json({ message: "teamName, boothNumber, dan password wajib diisi." });
    return;
  }
  // Cek duplikat sebelum insert
  const existing = await prisma.team.findFirst({
    where: { OR: [{ boothNumber }, { teamName }] },
  });
  if (existing) {
    const field =
      existing.boothNumber === boothNumber ? "Nomor stand" : "Nama tim";
    res.status(409).json({
      message: `${field} "${existing.boothNumber === boothNumber ? boothNumber : teamName}" sudah digunakan.`,
    });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const team = await prisma.team.create({
    data: { teamName, boothNumber, password: hashed },
    select: {
      id: true,
      teamName: true,
      boothNumber: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.status(201).json(team);
};

// PUT /api/v1/admin/teams/:id
export const updateTeam = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { teamName, boothNumber, password } = req.body;
  const data: Record<string, unknown> = {};
  if (teamName) data.teamName = teamName;
  if (boothNumber) data.boothNumber = boothNumber;
  if (password) data.password = await bcrypt.hash(password, 10);
  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "Tidak ada field yang diubah." });
    return;
  }
  const team = await prisma.team.update({
    where: { id },
    data,
    select: {
      id: true,
      teamName: true,
      boothNumber: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.json(team);
};

// DELETE /api/v1/admin/teams/:id
export const deleteTeam = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // assessments akan ikut terhapus (onDelete: Cascade di schema)
  await prisma.team.delete({ where: { id } });
  res.json({ message: "Tim berhasil dihapus." });
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS CRUD (Student & Lecturer)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/users
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

// POST /api/v1/admin/users
export const createUser = async (req: Request, res: Response) => {
  const { id, name, role, password } = req.body;
  if (!id || !name || !role) {
    res.status(400).json({ message: "id, name, dan role wajib diisi." });
    return;
  }
  if (!["STUDENT", "LECTURER"].includes(role)) {
    res.status(400).json({ message: "Role harus STUDENT atau LECTURER." });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) {
    res.status(409).json({ message: `ID ${id} sudah terdaftar.` });
    return;
  }
  const hashed = password ? await bcrypt.hash(password, 10) : null;
  const user = await prisma.user.create({
    data: { id, name, role, password: hashed },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.status(201).json(user);
};

// PUT /api/v1/admin/users/:id
export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, password } = req.body;
  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 10);
  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "Tidak ada field yang diubah." });
    return;
  }
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });
  res.json(user);
};

// DELETE /api/v1/admin/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.delete({ where: { id } });
  res.json({ message: "User berhasil dihapus." });
};
