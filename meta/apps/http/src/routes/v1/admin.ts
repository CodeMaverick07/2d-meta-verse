import { Router } from "express";

export const adminRouter = Router();
// "/api/v1/admin"
adminRouter.post("/element", (req, res) => {});
adminRouter.put("/element/:elementId", (req, res) => {});
adminRouter.get("/avatar", (req, res) => {});
adminRouter.get("/map", (req, res) => {});
