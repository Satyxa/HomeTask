import {Router, Response, Request} from "express";
import {patreonPosts, patreonBlogs, patreonComments, patreonUsers} from "../db/db";
import {commentsT, postT} from '../types'
import {blogIdValidation, checkAuth, checkValidation, commentValidator, postCreateValidation} from "../validation";
import {commentsPagAndSort, paginationSort, postPagAndSort} from "../PaginationAndSort";
import {AuthMiddleware} from "../AuthMiddleware";
import {Filter} from "mongodb";
import {DB_Utils} from "../DB-utils";


export const postsRouter = Router({})

postsRouter.get('/:id/comments', async (req: Request, res: Response) => {
    const id = req.params.id
    const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)
    // const filter: Filter<commentsT> = {$and: [{postId: id},{userLogin: {$regex: searchNameTerm ?? '', $options: 'i'}}]}
    const filter: Filter<commentsT> = {postId: id}
    const totalCount = await patreonComments.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    if (!await patreonPosts.findOne({id}))return res.sendStatus(404)

    const comments = await commentsPagAndSort(filter, sortBy, sortDirection, pageSize, pageNumber)

    return res.status(200).send({
        pagesCount, page: +pageNumber,
        pageSize, totalCount, items: comments})
})

postsRouter.post('/:id/comments',AuthMiddleware, ...commentValidator, checkValidation, async (req:Request, res:Response) => {
    const id = req.params.id
    const content: string = req.body.content

    if(!await patreonPosts.findOne({id})) return res.sendStatus(404)
    const user = await patreonUsers.findOne({id: req.userId!})
    if(!user)return res.sendStatus(404)

    const {comment, viewComment} = DB_Utils.createComment(id, content, user)

    await patreonComments.insertOne({...comment})
    await patreonPosts.updateOne({id}, {$push: {comments: comment}})
    return res.status(201).send(viewComment)
})

postsRouter.get('/', async (req: Request, res: Response) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)
    const totalCount = await patreonPosts.countDocuments({})
    const pagesCount = Math.ceil(totalCount / pageSize)

    const posts = await postPagAndSort({}, sortBy, sortDirection, pageSize, pageNumber)
    return res.status(200).send({
    pagesCount, page: pageNumber,
    pageSize, totalCount, items: posts})
})

postsRouter.get('/:id', async (req: Request, res: Response) => {
    const {foundPost} = await DB_Utils.findPost(req, res)
    if (!foundPost) return res.sendStatus(404)
    return res.status(200).send(foundPost)
})

postsRouter.post('/', checkAuth, ...postCreateValidation, ...blogIdValidation, checkValidation, async (req: Request, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body
    const blog = await patreonBlogs.findOne({id: blogId})
    if(!blog) return res.sendStatus(404)
    const newPost: postT = DB_Utils.createPost(title, shortDescription, content, blogId, blog.name)

    await patreonPosts.insertOne({...newPost})
    delete newPost.comments
    return res.status(201).send(newPost)
})

postsRouter.put('/:id', checkAuth, ...postCreateValidation,...blogIdValidation, checkValidation, async (req: Request, res: Response) => {
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
    if(result.deletedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
})