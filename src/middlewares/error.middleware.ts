import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Log ke terminal supaya kelihatan error aslinya
  console.error("❌ Unhandled Error:", err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
    // Tampilkan detail error di development agar mudah debug
    ...(process.env.NODE_ENV !== "production" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
