import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? "8h";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login/admin
// Body: { id: string, password: string }
// ─────────────────────────────────────────────────────────────────────────────
export const loginAdmin = async (req: Request, res: Response) => {
  const { id, password } = req.body;

  if (!id || !password) {
    res.status(400).json({ message: "ID dan password wajib diisi." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || user.role !== "ADMIN") {
    res.status(401).json({ message: "ID Admin tidak ditemukan." });
    return;
  }

  if (!user.password) {
    res.status(401).json({ message: "Akun ini tidak memiliki password." });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Password salah." });
    return;
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  } as jwt.SignOptions);

  res.json({
    message: "Login Admin berhasil.",
    token,
    user: { id: user.id, name: user.name, role: user.role },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login/participant
// Body: { boothNumber: string, password: string }
// ─────────────────────────────────────────────────────────────────────────────
export const loginParticipant = async (req: Request, res: Response) => {
  const { boothNumber, password } = req.body;

  if (!boothNumber || !password) {
    res.status(400).json({ message: "Nomor stand dan password wajib diisi." });
    return;
  }

  const team = await prisma.team.findUnique({ where: { boothNumber } });

  if (!team) {
    res.status(401).json({ message: "Nomor stand tidak ditemukan." });
    return;
  }

  const isMatch = await bcrypt.compare(password, team.password);
  if (!isMatch) {
    res.status(401).json({ message: "Password salah." });
    return;
  }

  // Token untuk participant pakai teamId sebagai id
  const token = jwt.sign(
    { id: team.id, role: "PARTICIPANT", boothNumber: team.boothNumber },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES } as jwt.SignOptions,
  );

  res.json({
    message: "Login Tim berhasil. Perangkat terkunci ke mode Kiosk.",
    token,
    team: {
      id: team.id,
      teamName: team.teamName,
      boothNumber: team.boothNumber,
    },
  });
};
