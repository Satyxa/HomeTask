import {Router, Response, Request} from "express";
import {patreonBlogs, patreonPosts, patreonUsers} from "../db/db";
import {postT, blogsT} from '../types'
import * as uuid from 'uuid'
import {Filter} from "mongodb";
import {blogsCreateValidation, postCreateValidation, checkAuth} from "../validation";
import {paginationSort} from "../PaginationAndSort";


export const blogsRouter = Router({})

blogsRouter.get('/:id/posts', async(req: Request, res: Response) => {
    const {id} = req.params
    const findBlog = await patreonBlogs.find({id}, { projection : { _id:0 }}).toArray()

    if(!findBlog || findBlog.length === 0) return res.sendStatus(404)

    const pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    const pageSize:number = req.query.pageSize ? +req.query.pageSize : 10
    const sortBy = req.query.sortBy as string ? req.query.sortBy : 'createdAt'
    const totalCount = await patreonPosts.countDocuments({blogId: id})
    const pagesCount = Math.ceil(totalCount / pageSize)

    let sortDirection = "desc"
        if(req.query.sortDirection){
            if(req.query.sortDirection === 'asc'){
                sortDirection = 'asc'
            }
        }

    const posts = await patreonPosts
        .find({blogId: id}, { projection : { _id:0 }})
        //@ts-ignore
        .sort({[sortBy!]: sortDirection === 'desc' ? -1 : 1})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .toArray()
    return res.status(200).send({
            pagesCount, page: pageNumber,
            pageSize, totalCount, items: posts})
})

blogsRouter.get('/', async(req: Request, res: Response) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm} = await paginationSort(req)
    const filter: Filter<blogsT> = {name: {$regex: searchNameTerm ?? '', $options: 'i'}}
    const totalCount = await patreonBlogs.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

        let sortDirection = "desc"
        if(req.query.sortDirection){
            if(req.query.sortDirection === 'asc'){
                sortDirection = 'asc'
            }
        }
    const blogs = await patreonBlogs
        .find({}, { projection : { _id:0 }})
        //@ts-ignore
        .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .toArray()

        return res.status(200).send({
                                        pagesCount, page: +pageNumber,
                                        pageSize, totalCount, items: blogs})
})

blogsRouter.get('/:id', async(req: Request, res: Response) => {
    const {id} = req.params
    const foundBlog = await patreonBlogs
        .find({id}, { projection : { _id:0 }})
        .toArray()
    if(!foundBlog || foundBlog.length === 0){return res.sendStatus(404)}
    else {res.status(200).send(foundBlog[0])}
})

blogsRouter.post('/:id/posts',checkAuth,postCreateValidation, async(req: Request, res: Response) => {
    const {id} = req.params
    const blogs = await patreonBlogs
        .find({id}, { projection : { _id:0 }}).toArray()
    if(!blogs || blogs.length === 0) return res.sendStatus(404)
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
            $set: {id, name, description, websiteUrl}
        })
    if(result.matchedCount === 1){return res.sendStatus(204)}
    else {return res.sendStatus(404)}
})

blogsRouter.delete('/:id',checkAuth, async (req: Request, res: Response) => {
    const {id} = req.params
    const result = await patreonBlogs.deleteOne({id})

    if(result.deletedCount === 1){return res.sendStatus(204)}
    else {return res.sendStatus(404)}
})

