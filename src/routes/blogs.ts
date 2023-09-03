import {Router, Response, Request} from "express";
import {patreonBlogs, patreonPosts} from "../db/db";
import {postT, blogsT} from '../types'
import * as uuid from 'uuid'
import {Filter} from "mongodb";
import {blogsCreateValidation, postCreateValidation, checkAuth,
    checkValidation
} from "../validation";
import {blogPagAndSort, paginationSort, postPagAndSort} from "../PaginationAndSort";
import {DB_Utils} from "../DB-utils";


export const blogsRouter = Router({})

blogsRouter.get('/:id/posts', async(req: Request, res: Response) => {
    const {id} = await DB_Utils.findBlog(req, res)
    const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)

    const totalCount = await patreonPosts.countDocuments({blogId: id})
    const pagesCount = Math.ceil(totalCount / pageSize)
    const findFilter = {blogId: id}
    const posts = await postPagAndSort(findFilter, sortBy, sortDirection , pageSize, pageNumber)
    return res.status(200).send({
            pagesCount, page: pageNumber,
            pageSize, totalCount, items: posts})
})

blogsRouter.get('/', async(req: Request, res: Response) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = await paginationSort(req)
    const filter: Filter<blogsT> = {name: {$regex: searchNameTerm ?? '', $options: 'i'}}
    const totalCount = await patreonBlogs.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const blogs = await blogPagAndSort(filter, sortBy, sortDirection , pageSize, pageNumber)
    return res.status(200).send({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogs})
})

blogsRouter.get('/:id', async(req: Request, res: Response) => {
    const {foundBlog} = await DB_Utils.findBlog(req, res)
    return res.status(200).send(foundBlog)
})

blogsRouter.post('/:id/posts',checkAuth,...postCreateValidation, checkValidation, async(req: Request, res: Response) => {
    const {id} = await DB_Utils.findBlog(req, res)
    const {title, shortDescription, content} = req.body
    const newPost: postT = {
        id: uuid.v4(),
        title,
        shortDescription,
        content,
        blogId: id,
        blogName: 'string',
        createdAt: new Date().toISOString(),
        comments: []
    }
    await patreonPosts.insertOne({...newPost})
    delete newPost.comments
    res.status(201).send(newPost)
})

blogsRouter.post('/',checkAuth, ...blogsCreateValidation,checkValidation, async(req: Request, res: Response) => {
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

blogsRouter.put('/:id', checkAuth, ...blogsCreateValidation,checkValidation, async(req:Request, res: Response)=>{
    const {id} = req.params
    const {name, description, websiteUrl} = req.body
        const result = await patreonBlogs.updateOne({id}, {
            $set: {id, name, description, websiteUrl}
        })
    if(result.matchedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
})

blogsRouter.delete('/:id',checkAuth, async (req: Request, res: Response) => {
    const {id} = req.params
    const result = await patreonBlogs.deleteOne({id})
    if (result.deletedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
})

