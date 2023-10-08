import {Router, Response, Request} from "express";
import {CommentModel} from "../db/CommentModel";
import {AuthMiddleware} from "../AuthMiddleware";
import {checkValidation, commentValidator, getResultValidation, isLikeStatusCorrect} from "../validation";
import {DB_Utils} from "../DB-utils";
import {commentsT} from "../types";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const comment = await CommentModel.findOne({id}, {projection: {_id: 0, postId: 0}}).lean()
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

commentsRouter.put('/:commentId/like-status', AuthMiddleware, ...isLikeStatusCorrect, checkValidation, async (req:Request, res: Response) => {
    try {
        const commentId = req.params.commentId
        const {likeStatus} = req.body
        if(!await CommentModel.findOne({id: commentId})) return res.sendStatus(404)
        const comment = await CommentModel.findOne({id: commentId}).lean()
        const reaction = DB_Utils.createReaction(req.userId, likeStatus)
        console.log(comment)
        const commentCopy:commentsT = {...comment}
        console.log(commentCopy)
        const newReactionsArray = commentCopy.reactions.filter(el => el.userId !== req.userId)
        const likesCount = commentCopy.reactions.filter(el => el.status === 'Like').length
        const dislikesCount = commentCopy.reactions.filter(el => el.status === 'Dislike').length
        newReactionsArray.push(reaction)
        const result = await CommentModel.findOneAndUpdate({id: commentId}, {$set:
                {reactions: newReactionsArray, 'likesInfo.likesCount': likesCount,
                    'likesInfo.dislikesCount': dislikesCount, 'likesInfo.myStatus': likeStatus}})
        return res.sendStatus(204)
    } catch (err){
        console.log(err + `=> put likes for comment "/:commentId/like-status" commentsRouter`)
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


