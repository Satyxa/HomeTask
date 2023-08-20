import {Router, Response, Request, NextFunction} from "express";
import {db} from "../db";
import {ValidationErrorType} from './videos'


export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        if(req.headers.authorization !== 'YWRtaW46cXdlcnR5'){
            return res.sendStatus(401)
        }
        const data = atob((req.headers.authorization).replace('Basic ', ''))
        const login = data.split(':')[0]
        const password = data.split(':')[1]
        console.log(data, login, password)
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
    if (!content || content.length > 1000) {
        errors.push({message: 'invalid content', field: 'content'})
    }
    if (!blogId) {
        errors.push({message: 'invalid blogId', field: 'blogId'})
    }
    if (errors.length) {
        return res.status(400).send({
            errorsMessages: errors
        })
    } else {
        next()
    }
}

export const postsRouter = Router({})

postsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).send(db.posts)
})
// @ts-ignore
postsRouter.get('/:id', (req: Request, res: Response) => {
    const {id} = req.params
    const foundPost = db.posts.find(post => post.id === id)
    if (!foundPost) {
        return res.sendStatus(404)
    } else {
        res.status(200).send(foundPost)
    }
})

postsRouter.post('/', checkAuth, postCreateValidation, (req: Request, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body
    const newPost: postT = {
        id: (db.posts.length + 1).toString(),
        title,
        shortDescription,
        content,
        blogId,
        blogName: 'string'
    }
    db.posts.push(newPost)
    res.status(201).send({newPost, content: db.posts})
})

postsRouter.put('/:id', checkAuth, postCreateValidation, (req: Request, res: Response) => {
    const {id} = req.params
    const {title, shortDescription, content, blogId} = req.body
    let foundPost: postT = db.posts.find(post => post.id === id)
    if (!foundPost) {
        return res.sendStatus(404)
    } else {
        let foundPostIndex: number = db.posts.findIndex(post => post.id === id)
        foundPost = {
            id,
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'string'
        }
        db.posts[foundPostIndex] = foundPost
        return res.status(200).send(db.posts)
    }
})

postsRouter.delete('/:id', checkAuth, (req: Request, res: Response) => {
    const {id} = req.params
    const foundPost = db.posts.find(post => post.id === id)
    if (!foundPost) {
        return res.sendStatus(404)
    } else {
        let foundPostIndex: number = db.posts.findIndex(post => post.id === id)
        db.posts.splice(foundPostIndex)

        return res.status(200).send(db.posts)
    }
})