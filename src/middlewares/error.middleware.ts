import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("❌ Unhandled Error:", err.message);
  res.status(500).json({
    message: "Terjadi kesalahan internal pada server.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
