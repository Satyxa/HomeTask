import {Router, Response, Request, NextFunction} from "express";
import {db} from "../db";
import * as uuid from 'uuid'
import {ValidationErrorType} from './videos'
import {body} from "express-validator";
import {checkAuth} from "./posts";

export type blogsT = {
    id: string
    name: string
    description: string
    websiteUrl: string
}
// @ts-ignore
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

blogsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).send(db.blogs)
})
// @ts-ignore
blogsRouter.get('/:id', (req: Request, res: Response) => {
    const {id} = req.params
    const foundBlog = db.blogs.find(blog => blog.id === id)
    if(!foundBlog){
        return res.sendStatus(404)
    } else {
        res.status(200).send(foundBlog)
    }
})

blogsRouter.post('/',checkAuth, blogsCreateValidation,(req: Request, res: Response) => {
    const {name, description, websiteUrl} = req.body
    const newBlog: blogsT = {
        id: (db.blogs.length + 1).toString(),
        name,
        description,
        websiteUrl
    }
    db.blogs.push(newBlog)
    res.status(201).send(newBlog)
})

blogsRouter.put('/:id',checkAuth,  blogsCreateValidation,(req:Request, res: Response)=>{
    const {id} = req.params
    const {name, description, websiteUrl} = req.body
    let foundBlog: blogsT = db.blogs.find(blog => blog.id === id)
    if(!foundBlog){
        return res.sendStatus(404)
    } else {
        let foundBlogIndex: number = db.blogs.findIndex(blog => blog.id === id)
        foundBlog = {
            id,
            name,
            description,
            websiteUrl
        }
        db.blogs[foundBlogIndex] = foundBlog
        return res.sendStatus(204)
    }
})

blogsRouter.delete('/:id',checkAuth, (req: Request, res: Response) => {
    const {id} = req.params
    const foundBlog = db.blogs.find(blog => blog.id === id)
    if(!foundBlog){
        return res.sendStatus(404)
    } else {
        let foundBlogIndex: number = db.blogs.findIndex(blog => blog.id === id)
        db.blogs.splice(foundBlogIndex)

        return res.sendStatus(204)
    }
})

