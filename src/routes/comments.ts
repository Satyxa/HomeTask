import {Router, Response, Request} from "express";
import {patreonBlogs, patreonComments} from "../db/db";
import {AuthMiddleware} from "../AuthMiddleware";
import {paginationSort} from "../PaginationAndSort";
import {Filter} from "mongodb";
import {commentsT} from "../types";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const comment = await patreonComments.findOne({id}, {projection: {_id: 0, postId: 0}})
    console.log(comment)
    return res.status(200).send(comment)
})

commentsRouter.put('/:id', AuthMiddleware, async(req:Request, res:Response) => {
    console.log(req.userId)
    const id = req.params.id
    const comment = await patreonComments.findOne({id})
    if (req.userId !== comment.commentatorInfo.userId) {
        console.log('here')
        return res.sendStatus(403)
    }
    const content = req.body.content
    const result = await patreonComments
        .updateOne({id},
        {$set: {content}})
    if(result.matchedCount === 1){
        return res.sendStatus(204)
    } else {
        return res.sendStatus(404)
    }
})

commentsRouter.delete('/:id', AuthMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id
    const comment = await patreonComments.findOne({id})
    if (req.userId !== comment.commentatorInfo.userId){
        console.log('here')
        return res.sendStatus(403)
    }
    const result = await patreonComments.deleteOne({id})
    if(result.deletedCount === 0){
        return res.sendStatus(404)
    } else{
        return res.status(204)
    }
})


