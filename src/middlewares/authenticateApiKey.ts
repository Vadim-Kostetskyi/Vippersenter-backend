import { Request, Response, NextFunction } from "express";

export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader || authHeader !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
}
