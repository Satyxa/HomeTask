import {Router, Response, Request} from "express";
import {patreonComments} from "../db/db";
import {AuthMiddleware} from "../AuthMiddleware";


export const commentsRouter = Router({})

commentsRouter.get('/', async (req: Request, res: Response) => {
    const comments = await patreonComments.find({}).toArray()
    return res.status(200).send(comments)
})

commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const comment = await patreonComments.find({id}).toArray()
    return res.status(200).send(comment)
})

commentsRouter.put('/:id', AuthMiddleware, async(req:Request, res:Response) => {
    const id = req.params.id
    const comment = await patreonComments.findOne({id})
    if(comment.userId !== req.userId) return res.sendStatus(403)
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
    if(comment.userId !== req.userId) return res.sendStatus(403)
    const result = await patreonComments.deleteOne({id})
    if(result.deletedCount === 0){
        return res.sendStatus(404)
    } else{
        return res.status(204)
    }
})


