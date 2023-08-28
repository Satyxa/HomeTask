import {Router, Response, Request} from "express";
import {patreonPosts, patreonBlogs} from "../db/db";
import {postT} from '../types'
import * as uuid from 'uuid'
import {checkAuth, postCreateValidation} from "../validation";
import {paginationSort} from "../PaginationAndSort";


export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    const {pageNumber, pageSize, sortBy} = await paginationSort(req)
    const totalCount = await patreonPosts.countDocuments({})
    const pagesCount = Math.ceil(totalCount / pageSize)

        let sortDirection = "desc"
        if(req.query.sortDirection){
            if(req.query.sortDirection === 'asc'){
                sortDirection = 'asc'
            }
        }

            const posts = await patreonPosts
                .find({}, { projection : { _id:0 }})
                //@ts-ignore
                .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
                .skip(pageSize * pageNumber - pageSize)
                .limit(pageSize)
                .toArray()
            return res.status(200).send({
                pagesCount,
                page: pageNumber,
                pageSize,
                totalCount,
                items: posts})
})

postsRouter.get('/:id', async (req: Request, res: Response) => {
    const {id} = req.params
    const foundPost = await patreonPosts.find({id}, { projection : { _id:0 }}).toArray()
    if (!foundPost || foundPost.length === 0) {return res.sendStatus(404)}
    else {res.status(200).send(foundPost[0])}
})

postsRouter.post('/', checkAuth, postCreateValidation, async (req: Request, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body
    const blog = await patreonBlogs.findOne({id: blogId})
    if(!blog) return res.sendStatus(404)
    const newPost: postT = {
        id: uuid.v4(),
        title,
        shortDescription,
        content,
        blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString()
    }
    await patreonPosts.insertOne({...newPost})
    res.status(201).send(newPost)
})

postsRouter.put('/:id', checkAuth, postCreateValidation, async (req: Request, res: Response) => {
    const {id} = req.params
    const {title, shortDescription, content, blogId} = req.body
    const blog = await patreonBlogs.findOne({id: blogId})
    const result = await patreonPosts.updateOne({id},
            {
                $set: {
                    title,
                    shortDescription,
                    content,
                    blogId,
                    blogName: blog!.name,
                }
            })
    if(result.matchedCount === 1){return res.sendStatus(204)}
    else {return res.sendStatus(404)}
})

postsRouter.delete('/:id', checkAuth,async (req: Request, res: Response) => {
    const {id} = req.params
    const result = await patreonPosts.deleteOne({id})
    if(result.deletedCount === 1){return res.sendStatus(204)}
    else {return res.sendStatus(404)}
})