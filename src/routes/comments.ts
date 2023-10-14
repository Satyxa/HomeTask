import {Router, Response, Request} from "express";
import {CommentModel} from "../db/CommentModel";
import {AuthMiddleware} from "../AuthMiddleware";
import {checkValidation, commentValidator, getResultValidation, isLikeStatusCorrect} from "../validation";
import {DB_Utils} from "../DB-utils";
import {commentsT, reactionsT} from "../types";
import {ModifyResult} from "mongodb";
import {getUserIdByToken} from "../authentication";
import {UpdateWriteOpResult } from 'mongoose'


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const comment: commentsT | null = await CommentModel.findOne({id}, {projection: {_id: 0, postId: 0, reactions: 0}}).lean()
        if(!comment) return res.sendStatus(404)
        let userId:string;
        if(req.headers.authorization){
            const accessToken = req.headers.authorization.split(' ')[1]
            console.log(accessToken)
            userId = getUserIdByToken(accessToken)
        }
        const isReactionsFromUser = comment.reactions.filter(el => el.userId === userId)
        if(isReactionsFromUser.length){
            const updatedComment = await CommentModel.findOneAndUpdate({id},
                {'likesInfo.myStatus': isReactionsFromUser[0].status},
                {new: true, projection: {reactions: 0, _id: 0, __v: 0, postId: 0}})
            return res.status(200).send(updatedComment)
        } else {
            const updatedComment = await CommentModel.findOneAndUpdate({id},
                {'likesInfo.myStatus': 'None'},
                {new: true, projection: {reactions: 0, _id: 0, __v: 0, postId: 0}})
            return res.status(200).send(updatedComment)
        }

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
        const comment: commentsT| null = await CommentModel.findOne({id})
        if (!comment) return res.sendStatus(404)
        if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
        const content = req.body.content
        const result: UpdateWriteOpResult = await CommentModel
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
        const comment = await CommentModel.findOne({id: commentId}).lean()
        if(!comment) return res.sendStatus(404)
        const reaction = DB_Utils.createReaction(req.userId!, likeStatus)
        const commentCopy = {...comment}
        const userLikeStatus = commentCopy.reactions.filter(reaction => reaction.userId === req.userId)[0]
        console.log('reaction', userLikeStatus)
        if(!userLikeStatus && likeStatus !== 'None'){
           const likesCount = likeStatus =='Like' ? 1 : 0
            const dislikesCount = likeStatus == "Dislike" ? 1 : 0
            const result = await CommentModel.updateOne({id: commentId},
                    {$push: {reactions: reaction}, $inc:  {'likesInfo.likesCount': likesCount, 'likesInfo.dislikesCount': dislikesCount},})
            return res.sendStatus(204)
        }
        if (userLikeStatus && userLikeStatus.status !== likeStatus){
            if(userLikeStatus.status == 'Like' && likeStatus =='Dislike'){
                 const result = await CommentModel.updateOne({id: commentId, reactions: {$elemMatch: {'userId': userLikeStatus.userId}}},
                    {$set: {reactions:reaction}, $inc: {'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1},}, {returnDocument: "after"})
                return res.sendStatus(204)
            }
            if(userLikeStatus.status == 'Like' && likeStatus == 'None'){
                 await CommentModel.updateOne({id: commentId},
                    {$pull: {reactions: {userId: req.userId}}, $inc: {'likesInfo.likesCount': -1},
                        })
                return res.sendStatus(204)
            }

            if(userLikeStatus.status == 'Dislike' && likeStatus =='Like'){

                    await CommentModel.updateOne({id: commentId, reactions: {$elemMatch: {'userId': userLikeStatus.userId}}},
                        {$set: {reactions: reaction}, $inc: {'likesInfo.dislikesCount': -1, 'likesInfo.likesCount': 1},})
                    return res.sendStatus(204)
                }
            if(userLikeStatus.status == 'Dislike' && likeStatus == 'None'){
                    await CommentModel.updateOne({id: commentId},
                        {$pull: {reactions: {userId: req.userId}}, $inc: {'likesInfo.dislikesCount': -1},
                        })
                    return res.sendStatus(204)
                }
           return res.sendStatus(204)
        }

        return res.sendStatus(204)
    } catch (err){
        console.log(err + `=> put likes for comment "/:commentId/like-status" commentsRouter`)
    }
})

commentsRouter.delete('/:id', AuthMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const comment: commentsT | null = await CommentModel.findOne({id})
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


