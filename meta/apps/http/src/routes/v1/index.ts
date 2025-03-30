import { Router } from "express";
import { SigninSchema, SignupSchema } from "../../types";
import client from "@repo/db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
export const router = Router();

router.post("/signup", async (req, res) => {
  const parseData = SignupSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }
  const hashPassword = bcrypt.hashSync(parseData.data.password, 10);
  try {
    
    const user = await client.user.create({
      data: {
        username: parseData.data.username,
        password: hashPassword,
        role: parseData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.status(200).json({ userId: user.id });
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
});
router.post("/signin", async (req, res) => {
  const parseData = SigninSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }
  try {
    const user = await client.user.findFirst({
      where: {
        username: parseData.data.username,
      },
    });
    if (!user) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }
    if (!bcrypt.compareSync(parseData.data.password, user.password)) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    res.status(403).json({ message: "Invalid credentials" });
  }
});

router.get("/elements", (req, res) => {});

router.get("/avatars", (req, res) => {});
