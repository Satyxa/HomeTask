import {Router, Response, Request, NextFunction} from "express";
import {client} from "../db/db";
import {ValidationErrorType} from './videos'
import {checkAuth} from "./posts";
import * as uuid from 'uuid'
export type blogsT = {
    id: string
    name: string
    description: string
    websiteUrl: string
    isMembership: boolean
    createdAt: string
}
// @ts-ignore
export const patreonBlogs = client.db('patreon').collection<blogsT>('blogs')

const blogsCreateValidation = (req: Request, res: Response, next: NextFunction) => {
    const {name, description, websiteUrl} = req.body
    const errors:ValidationErrorType[] = []
    if(!name || !name.trim() || name.length > 15){
        errors.push({message: 'invalid name', field: 'name'})
    }
    if(!description || !description.trim() || description.length > 500){
        errors.push({message: 'invalid description', field: 'description'})
    }
    if(!websiteUrl || websiteUrl.length > 100 || !websiteUrl.includes('http', 0) ){
        errors.push({message: 'invalid websiteUrl', field: 'websiteUrl'})
    }
    if (errors.length){
        return res.status(400).send({
            errorsMessages: errors
        })
    } else {
        next()
    }
}

export const blogsRouter = Router({})

blogsRouter.get('/', async(req: Request, res: Response) => {

    const blogs = await patreonBlogs.find({}, { projection : { _id:0 }}).toArray()
    res.status(200).send(blogs)
})

blogsRouter.get('/:id', async(req: Request, res: Response) => {
    const {id} = req.params
    const foundBlog = await patreonBlogs.find({id}, { projection : { _id:0 }}).toArray()
    if(!foundBlog || foundBlog.length === 0){
        return res.sendStatus(404)
    } else {
        res.status(200).send(foundBlog[0])
    }
})

blogsRouter.post('/',checkAuth, blogsCreateValidation, async(req: Request, res: Response) => {
    const {name, description, websiteUrl} = req.body
    const newBlog: blogsT = {
        id: uuid.v4(),
        name,
        description,
        websiteUrl,
        isMembership: false,
        createdAt: new Date().toISOString()
    }
    await patreonBlogs.insertOne({...newBlog})

    res.status(201).send(newBlog)
})

blogsRouter.put('/:id',checkAuth,  blogsCreateValidation, async(req:Request, res: Response)=>{
    const {id} = req.params
    const {name, description, websiteUrl} = req.body

        const result = await patreonBlogs.updateOne({id}, {
            $set: {
                id,
                name,
                description,
                websiteUrl
            }
        })
        if(result.matchedCount === 1){
            return res.sendStatus(204)
        } else {
            return res.sendStatus(404)
        }

})

blogsRouter.delete('/:id',checkAuth, async (req: Request, res: Response) => {
    const {id} = req.params
    const result = await patreonBlogs.deleteOne({id})

    if(result.deletedCount === 1){
        return res.sendStatus(204)
    } else {
        return res.sendStatus(404)
    }

})

