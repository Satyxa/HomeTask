import {Router, Response, Request} from "express";
import {patreonComments} from "../db/db";
import {AuthMiddleware} from "../AuthMiddleware";
import {commentValidator, getResultValidation} from "../validation";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const comment = await patreonComments.findOne({id}, {projection: {_id: 0, postId: 0}})
    if(!comment) return res.sendStatus(404)
    return res.status(200).send(comment)
})

commentsRouter.put('/:id', commentValidator,AuthMiddleware, async(req:Request, res:Response) => {
    const resultValidation = getResultValidation(req)
    if (resultValidation !== 1) return res.status(400).send({errorsMessages: resultValidation})
    const id = req.params.id
    const comment = await patreonComments.findOne({id})
    if (!comment) return res.sendStatus(404)
    if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
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
    if (!comment) return res.sendStatus(404)
    if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
    const result = await patreonComments.deleteOne({id})
    if(result.deletedCount === 0){
        return res.sendStatus(404)
    } else{
        return res.sendStatus(204)
    }
})


