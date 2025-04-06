import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db";
import { userMiddleware } from "../../middlewares/user.middleware";

export const userRouter = Router();

// userRouter.post("/metadata", userMiddleware, async (req, res) => {

//   try {
//     await client.user.update({
//       where: {
//         id: req.userId,
//       },
//       data: {
//         avatarId: req.body.avatarId,
//       },
//     });
//     res.status(200).json({ message: "success" });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid data" });
//     return;
//   }
// });

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  try {
    await client.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatarId: parsedData.data.avatarId,
      },
    });
    res.json({ message: "Metadata updated" });
  } catch (e) {
    res.status(400).json({ message: "Internal server error" });
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");
  try {
    const metadata = await client.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        avatarId: true,
        id: true,
      },
    });
    res
      .json({
        avatars: metadata.map((m:any) => ({ userId: m.id, avatarId: m.avatarId })),
      })
      .status(200);
  } catch (error) {
    res.status(400).json({ message: "Invalid data" });
  }
});
