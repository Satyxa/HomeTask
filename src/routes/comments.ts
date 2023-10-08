import {Router, Response, Request} from "express";
import {CommentModel} from "../db/CommentModel";
import {AuthMiddleware} from "../AuthMiddleware";
import {checkValidation, commentValidator, getResultValidation, isLikeStatusCorrect} from "../validation";
import {DB_Utils} from "../DB-utils";
import {commentsT} from "../types";
import {ModifyResult} from "mongodb";
import {getUserIdByToken} from "../authentication";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        let userId:string;
        if(req.headers.authorization){
            const accessToken = req.headers.authorization.split(' ')[1]
            console.log(accessToken)
            userId = getUserIdByToken(accessToken)
        }
        const id = req.params.id
        const comment = await CommentModel.findOne({id}, {projection: {_id: 0, postId: 0, reactions: 0}}).lean()
        if(!comment) return res.sendStatus(404)
        const isReactionsFromUser = comment.reactions.filter(el => el.userId === userId)
        console.log(4444444444)
        console.log(isReactionsFromUser)
        console.log(userId)
        if(isReactionsFromUser.length){
            console.log(5555555555555555555)
            console.log(isReactionsFromUser[0].status + '45444545454')
            const updatedComment = await CommentModel.findOneAndUpdate({id}, {'likesInfo.myStatus': isReactionsFromUser[0].status}, {new: true})
            console.log(2222222222)
            console.log(updatedComment)
            return res.status(200).send(updatedComment)
        } else {
            const updatedComment = await CommentModel.findOneAndUpdate({id}, {'likesInfo.myStatus': 'None'}, {new: true})
            console.log(3333333333)
            console.log(updatedComment)
            return res.status(200).send(comment)
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
        const comment: commentsT = await CommentModel.findOne({id})
        if (!comment) return res.sendStatus(404)
        if (req.userId !== comment.commentatorInfo.userId)return res.sendStatus(403)
        const content = req.body.content
        const result: ModifyResult = await CommentModel
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
        console.log(77777777777)
        console.log(comment)
        const reaction = DB_Utils.createReaction(req.userId, likeStatus)
        const commentCopy:commentsT = {...comment}
        const newReactionsArray = commentCopy.reactions.filter(el => el.userId !== req.userId)
        console.log(6666664666)
        console.log(newReactionsArray)
        newReactionsArray.push(reaction)
        console.log(newReactionsArray)
        const likesCount = commentCopy.reactions.filter(el => el.status === 'Like').length
        const dislikesCount = commentCopy.reactions.filter(el => el.status === 'Dislike').length
        console.log(likesCount)
        console.log(dislikesCount)
        console.log(8888888888)
        console.log(newReactionsArray)
        const result = await CommentModel.findOneAndUpdate({id: commentId}, {$set:
                {reactions: newReactionsArray, 'likesInfo.likesCount': likesCount,
                    'likesInfo.dislikesCount': dislikesCount}}, {returnDocument: "after"})
        console.log(1111111111111)
        console.log(result)
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


