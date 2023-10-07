import {Router, Response, Request} from "express";
import {CommentModel} from "../db/CommentModel";
import {AuthMiddleware} from "../AuthMiddleware";
import {commentValidator, getResultValidation} from "../validation";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const comment = await CommentModel.findOne({id}, {projection: {_id: 0, postId: 0}})
        if(!comment) return res.sendStatus(404)
        return res.status(200).send(comment)
    } catch (err){
        console.log(err, `=> get comment by id "/:id" commentsRouter`)
        return res.sendStatus(500)
    }
})

commentsRouter.put('/:id', commentValidator,AuthMiddleware, async(req:Request, res:Response) => {
    try {
        const resultValidation = getResultValidation(req)
        if (resultValidation !== 1) return res.status(400).send({errorsMessages: resultValidation})
        const id = req.params.id
        const comment = await CommentModel.findOne({id})
        if (!comment) return res.sendStatus(404)
        if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
        const content = req.body.content
        const result = await CommentModel
            .updateOne({id},
                {$set: {content}})
        if(result.matchedCount === 1)return res.sendStatus(204)
        else return res.sendStatus(404)
    } catch (err){
        console.log(err, `=> update comment by id "/:id" commentsRouter`)
        return res.sendStatus(500)
    }

})

commentsRouter.delete('/:id', AuthMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const comment = await CommentModel.findOne({id})
        if (!comment) return res.sendStatus(404)
        if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
        const result = await CommentModel.deleteOne({id})
        if(result.deletedCount === 0) return res.sendStatus(404)
        else return res.sendStatus(204)
    }
catch (err){
        console.log(err, `=> delete comment by id "/:id" commentsRouter`)
        return res.sendStatus(500)
    }
})


