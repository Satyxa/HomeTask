import {Router, Response, Request} from "express";
import {BlogModel} from "../db/BlogModel";
import {PostModel} from "../db/PostModel";
import {postT, blogsT} from '../types'
import * as uuid from 'uuid'
import {Filter} from "mongodb";
import {blogsCreateValidation, postCreateValidation, checkAuth,
    checkValidation
} from "../validation";
import {blogPagAndSort, paginationSort, postPagAndSort} from "../PaginationAndSort";
import {DB_Utils} from "../DB-utils";
import {getUserIdByToken} from "../authentication";


export const blogsRouter = Router({})

blogsRouter.get('/:id/posts', async(req: Request, res: Response) => {
    try {
        const {id, foundBlog} = await DB_Utils.findBlog(req, res)
        if (!foundBlog) return res.sendStatus(404)
        const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)

        const totalCount = await PostModel.countDocuments({blogId: id})
        const pagesCount = Math.ceil(totalCount / pageSize)
        const findFilter = {blogId: id}
        const posts = await postPagAndSort(findFilter, sortBy, sortDirection , pageSize, pageNumber)


        let userId = ''
        if(req.headers.authorization) {
            const accessToken = req.headers.authorization.split(' ')[1]
            userId = getUserIdByToken(accessToken)
        }
        const viewPosts = posts.map(post => {
            return {
                id: post.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.extendedLikesInfo.likesCount,
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    myStatus: post.reactions.reduce((ac, r) => {
                        if(r.userId === userId){
                            return ac = r.status
                        }
                        return ac
                    }, 'None'),
                    newestLikes: post.extendedLikesInfo.newestLikes.filter((el, i) => {
                        delete el._id
                        if (i < 3) return el
                    }
        )
                }
            }
        })


        return res.status(200).send({
            pagesCount, page: pageNumber,
            pageSize, totalCount, items: viewPosts})
    } catch (err){
        console.log(err, `=> get all posts for one blog "/:id/posts" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.get('/', async(req: Request, res: Response) => {
    try {
        const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = await paginationSort(req)
        const filter: Filter<blogsT> = {name: {$regex: searchNameTerm ?? '', $options: 'i'}}
        const totalCount = await BlogModel.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        const blogs = await blogPagAndSort(filter, sortBy, sortDirection , pageSize, pageNumber)
        return res.status(200).send({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogs})
    } catch (err){
        console.log(err, `=> get All Blogs "/" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.get('/:id', async(req: Request, res: Response) => {
    try {
        const {foundBlog} = await DB_Utils.findBlog(req, res)
        if (!foundBlog) return res.sendStatus(404)
        return res.status(200).send(foundBlog)
    } catch (err){
        console.log(err, `=> get One Blog "/:id" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.post('/:id/posts',checkAuth,...postCreateValidation, checkValidation, async(req: Request, res: Response) => {
    try {
        const {id, foundBlog} = await DB_Utils.findBlog(req, res)
        if(!foundBlog) return res.sendStatus(404)
        const {title, shortDescription, content} = req.body
        const newPost = {
            id: uuid.v4(),
            title,
            shortDescription,
            content,
            blogId: id,
            blogName: 'string',
            createdAt: new Date().toISOString(),
            comments: [],
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
        await PostModel.create({...newPost})
        delete newPost.comments
        res.status(201).send(newPost)
    } catch (err){
        console.log(err, `=> create new post for blog by id "/:id/posts" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.post('/',checkAuth, ...blogsCreateValidation,checkValidation, async(req: Request, res: Response) => {
    try {
        const {name, description, websiteUrl} = req.body
        const newBlog: blogsT = {
            id: uuid.v4(),
            name,
            description,
            websiteUrl,
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        await BlogModel.create({...newBlog})
        res.status(201).send(newBlog)
    } catch (err){
        console.log(err, `=> create blog (post method) "/" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.put('/:id', checkAuth, ...blogsCreateValidation,checkValidation, async(req:Request, res: Response)=>{
    try {
        const {id} = req.params
        const {name, description, websiteUrl} = req.body
        const result = await BlogModel.updateOne({id}, {
            $set: {id, name, description, websiteUrl}
        })
        if(result.matchedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(404)
    } catch (err){
        console.log(err, `=> update blog "/:id" blogsRouter`)
        return res.sendStatus(500)
    }
})

blogsRouter.delete('/:id',checkAuth, async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const result = await BlogModel.deleteOne({id})
        if (result.deletedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(404)
    } catch (err){
        console.log(err, `=> delete one Blog "/:id" blogsRouter`)
        return res.sendStatus(500)
    }
})

