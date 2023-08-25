import {Router, Response, Request, NextFunction} from "express";
import {client} from "../db/db";
import {ValidationErrorType} from './videos'
import * as uuid from 'uuid'


export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {

        if(req.headers.authorization === 'Basic admin:qwerty'){
            return res.sendStatus(401)
        }
        const data = atob((req.headers.authorization).replace('Basic ', ''))
        const login = data.split(':')[0]
        const password = data.split(':')[1]
        if (login === 'admin' && password === 'qwerty') {
            next()
        } else {
            return res.sendStatus(401)
        }
    } else {
        return res.sendStatus(401)
    }

}

export type postT = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}
// @ts-ignore
const postCreateValidation = (req: Request, res: Response, next: NextFunction) => {
    const {title, shortDescription, content, blogId} = req.body
    const errors: ValidationErrorType[] = []
    if (!title || !title.trim() || title.length > 30) {
        errors.push({message: 'invalid title', field: 'title'})
    }
    if (!shortDescription || !shortDescription.trim() || shortDescription.length > 100) {
        errors.push({message: 'invalid shortDescription', field: 'shortDescription'})
    }
    if (!content || !content.trim() || content.length > 1000) {
        errors.push({message: 'invalid content', field: 'content'})
    }
    if (!blogId) {
        errors.push({message: 'invalid blogId', field: 'blogId'})
    }
    if(errors.length){
        return res.status(400).send({
            errorsMessages: errors
        })
    } else {
        next()
    }
}

const patreonPosts = client.db('patreon').collection<postT>('posts')

export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    const posts = await patreonPosts.find({}).toArray()
    res.status(200).send(posts)
})
// @ts-ignore
postsRouter.get('/:id', async (req: Request, res: Response) => {
    const {id} = req.params
    const foundPost = await patreonPosts.find({id}).toArray()
    if (!foundPost || foundPost.length === 0) {
        return res.sendStatus(404)
    } else {
        res.status(200).send(foundPost[0])
    }
})

postsRouter.post('/', checkAuth, postCreateValidation, async (req: Request, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body
    const newPost: postT = {
        id: uuid.v4(),
        title,
        shortDescription,
        content,
        blogId,
        blogName: 'string',
        createdAt: new Date().toISOString()
    }
    await patreonPosts.insertOne(newPost)
    res.status(201).send(newPost)
})

postsRouter.put('/:id', checkAuth, postCreateValidation, async (req: Request, res: Response) => {
    const {id} = req.params
    const {title, shortDescription, content, blogId} = req.body

    const result = await patreonPosts.updateOne({id},
            {
                $set: {
                    title,
                    shortDescription,
                    content,
                    blogId,
                    blogName: 'string'
                }
            })

    if(result.matchedCount === 1){
        return res.sendStatus(204)
    } else {
        return res.sendStatus(404)
    }

})

postsRouter.delete('/:id', checkAuth,async (req: Request, res: Response) => {
    const {id} = req.params
    const result = await patreonPosts.deleteOne({id})
    if(result.deletedCount === 1){
        return res.sendStatus(204)
    } else {
        return res.sendStatus(404)
    }
})