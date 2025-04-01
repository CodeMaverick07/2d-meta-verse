import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  const token = header?.split(" ")[1];
  console.log("token", token);
  if (!token) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    console.log(decoded);
    if (decoded.role !== "Admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    req.userId = decoded.userId;
  } catch (error) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  next();
};
