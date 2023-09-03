import {Router, Response, Request} from "express";
import {patreonBlogs, patreonComments} from "../db/db";
import {AuthMiddleware} from "../AuthMiddleware";
import {paginationSort} from "../PaginationAndSort";
import {Filter} from "mongodb";
import {commentsT, errorField} from "../types";
import {commentValidator} from "../validation";
import {Result, ValidationError, validationResult} from "express-validator";


export const commentsRouter = Router({})


commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const comment = await patreonComments.findOne({id}, {projection: {_id: 0, postId: 0}})
    console.log(comment)
    return res.status(200).send(comment)
})

commentsRouter.put('/:id', commentValidator,AuthMiddleware, async(req:Request, res:Response) => {
    const resultValidation: Result<ValidationError> = validationResult(req)
    if(!resultValidation.isEmpty()){
        const errors = resultValidation.array({ onlyFirstError: true })
        const errorsFields: errorField[] = []

        errors.map((err: any) => {
            errorsFields.push({message: err.msg, field: err.path})
        })
        return res.status(400).send({errorsMessages: errorsFields})

    }
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


