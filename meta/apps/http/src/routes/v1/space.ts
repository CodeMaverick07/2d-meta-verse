import { MapElements } from "./../../../../../node_modules/.prisma/client/index.d";
import client from "@repo/db";
import { Router } from "express";
import { userMiddleware } from "../../middlewares/user";
import { CreateSpaceSchema } from "../../types";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parseData = CreateSpaceSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }
  const map = await client.map.findUnique({
    where: {
      id: parseData.data.mapId,
    },
    select: {
      elements: true,
    },
  });
  if (!map) {
    res.status(400).json({ message: "Invalid mapId" });
    return;
  }
  const space = await client.space.create({
    data: {
      name: parseData.data.name,
      width: Number(parseData.data.dimensions.split("x")[0]),
      height: Number(parseData.data.dimensions.split("x")[1]),
      creatorId: req.userId,
      elements: {
        create: map.elements.map((element: MapElements) => ({
          elementId: element.elementId,
          x: element.x,
          y: element.y,
        })),
      },
    },
  });
});

spaceRouter.delete("/:spaceId", (req, res) => {});

spaceRouter.get("/all", (req, res) => {});

spaceRouter.post("/element", (req, res) => {});

spaceRouter.delete("/element", (req, res) => {});

spaceRouter.get("/:spaceId", (req, res) => {});
