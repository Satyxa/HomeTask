import {Router, Response, Request, NextFunction} from "express";
import {client} from "../db/db";
import {ValidationErrorType} from './videos'
import {checkAuth, patreonPosts, postCreateValidation, postT} from "./posts";
import * as uuid from 'uuid'
export type blogsT = {
    id: string
    name: string
    description: string
    websiteUrl: string
    isMembership: boolean
    createdAt: string
}
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

blogsRouter.get('/:id/posts', async(req: Request, res: Response) => {
    const {id} = req.params
    const findBlog = await patreonBlogs.find({id}, { projection : { _id:0 }}).toArray()
    if(!findBlog || findBlog.length === 0){
        return res.sendStatus(404)
    }
    const pageNumber:number = req.query.pageNumber ? +req.query.pageNumber : 1
    const pageSize:number = req.query.pageSize ? +req.query.pageSize : 10
    const sortBy = req.query.sortBy || 'createdAt'
    let sortDirection = "desc"
    if(req.query.sortDirection){
        if(req.query.sortDirection === 'asc'){
            sortDirection = 'asc'
        }
    }
    const posts = await patreonPosts
        .find({blogId: id}, { projection : { _id:0 }})
        .skip(pageSize * pageNumber - pageSize)
        .sort({createdAt: sortDirection === 'desc' ? -1 : 1})
        .limit(pageSize)
        .toArray()
    function byField(fieldName){
        return (a, b) => a[fieldName] > b[fieldName] ? 1 : -1;
    }
    if(sortDirection === 'asc'){
        posts.sort(byField(sortBy))

    } else {
        posts.sort(byField(sortBy)).reverse()
    }
    const totalCount = await patreonPosts.countDocuments({blogId: id})
    const pagesCount = Math.ceil(totalCount / pageSize)
    return res
        .status(200)
        .send({pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: posts})
})

blogsRouter.post('/:id/posts',checkAuth,postCreateValidation, async(req: Request, res: Response) => {
    const {id} = req.params
    const blogs = await patreonBlogs.find({id}, { projection : { _id:0 }}).toArray()
    if(!blogs || blogs.length === 0){
        return res.sendStatus(404)
    }
    const {title, shortDescription, content} = req.body
    const newPost: postT = {
        id: uuid.v4(),
        title,
        shortDescription,
        content,
        blogId: id,
        blogName: 'string',
        createdAt: new Date().toISOString()
    }
    await patreonPosts.insertOne({...newPost})
    res.status(201).send(newPost)
})

blogsRouter.get('/', async(req: Request, res: Response) => {
        const pageNumber:number = req.query.pageNumber ? +req.query.pageNumber : 1
    const pageSize:number = req.query.pageSize ? +req.query.pageSize : 10
    let sortDirection = "desc"
    if(req.query.sortDirection){
        if(req.query.sortDirection === 'asc'){
            sortDirection = 'asc'
        }
    }
    const sortBy = req.query.sortBy || 'createdAt'
    const blogs = await patreonBlogs
        .find({}, { projection : { _id:0 }})
        .skip(pageSize * pageNumber - pageSize)
        .sort({createdAt: sortDirection === 'desc' ? -1 : 1})
        .limit(pageSize)
        .toArray()

    function byField(fieldName){
        return (a, b) => a[fieldName] > b[fieldName] ? 1 : -1;
    }
    if(sortDirection === 'asc'){
        blogs.sort(byField(sortBy))
    } else {
        blogs.sort(byField(sortBy)).reverse()
    }
        const totalCount = await patreonBlogs.countDocuments({})
        const pagesCount = Math.ceil(totalCount / pageSize)
        return res
            .status(200)
            .send(
                {
                    pagesCount,
                    page: pageNumber,
                    pageSize,
                    totalCount,
                    items: blogs
                })
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

