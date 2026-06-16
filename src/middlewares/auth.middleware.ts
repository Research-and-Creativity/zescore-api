import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token tidak ditemukan." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res
      .status(401)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ADMIN") {
    res
      .status(403)
      .json({ message: "Akses ditolak. Hanya Admin yang diizinkan." });
    return;
  }
  next();
};
