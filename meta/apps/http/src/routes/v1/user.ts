import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db"
import { userMiddleware } from "../../middlewares/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parseData = UpdateMetadataSchema.safeParse(req.body)
    if(!parseData.success){
        res.status(400).json({message:"Invalid data at /metadata"})
        return
    }
    try {
        await client.user.update({
            where:{
                id:req.userId
            },
            data:{
                avatarId:parseData.data.avatarId,
            }
        })
    } catch (error) {
        res.status(400).json({message:"Invalid data"})
        return
    }
});

userRouter.get("/metadata/bluk", async (req, res) => {
    const userIdString = (req.query.ids ?? "[]") as string
    const userIds = userIdString.slice(1,userIdString?.length-2).split(",")
    try {
      const metadata =  await client.user.findMany({
            where:{
                id:{
                    in:userIds
                }
            }, select:{
                avatarId:true,
                id:true,
            }
        })   
        res.json({avatars:metadata.map((m)=>({userId:m.id, avatarId:m.avatarId}))}).status(200)
    } catch (error) {
        res.status(400).json({message:"Invalid data"})
    }
});
