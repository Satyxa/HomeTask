import {Router, Response, Request} from "express";
import {UserModel} from '../db/UserModel'
import {PostModel} from "../db/PostModel";
import {BlogModel} from "../db/BlogModel";
import {CommentModel} from "../db/CommentModel";
import {blogsT, commentsT, newestLikesT, postT, reactionsT, UserAccountDBType} from '../types'
import {
    blogIdValidation,
    checkAuth,
    checkValidation,
    commentValidator,
    isLikeStatusCorrect,
    postCreateValidation
} from "../validation";
import {commentsPagAndSort, paginationSort, postPagAndSort} from "../PaginationAndSort";
import {AuthMiddleware} from "../AuthMiddleware";
import {Filter} from "mongodb";
import {DB_Utils} from "../DB-utils";
import {getUserIdByToken} from "../authentication";


export const postsRouter = Router({})

postsRouter.get('/:id/comments', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)
        const filter: Filter<commentsT> = {postId: id}
        const totalCount = await CommentModel.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        if (!await PostModel.findOne({id}))return res.sendStatus(404)

        const comments = await commentsPagAndSort(filter, sortBy, sortDirection, pageSize, pageNumber)
        let userId;
        if(req.headers.authorization){
            const accessToken = req.headers.authorization.split(' ')[1]
            userId = getUserIdByToken(accessToken)

            const viewComments = comments.map(c => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt,
                commentatorInfo: c.commentatorInfo,
                likesInfo: {
                    likesCount: c.likesInfo.likesCount,
                    dislikesCount: c.likesInfo.dislikesCount,
                    myStatus: c.reactions.reduce((ac, r)=>{
                        if(r.userId == userId) {
                            ac = r.status;
                            return ac
                        }
                        return ac
                    }, 'None')
                }
            }))
            return res.status(200).send({
                pagesCount, page: +pageNumber,
                pageSize, totalCount, items: viewComments})
        }

        return res.status(200).send({
            pagesCount, page: +pageNumber,
            pageSize, totalCount, items: comments})
    } catch (err){
        console.log(err, `=> get "/:id/comments" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.post('/:id/comments',AuthMiddleware, ...commentValidator, checkValidation, async (req:Request, res:Response) => {
    try {
        const id = req.params.id
        const content: string = req.body.content

        if(!await PostModel.findOne({id})) return res.sendStatus(404)
        const user = await UserModel.findOne({id: req.userId!})
        if(!user)return res.sendStatus(404)

        const {comment, viewComment} = DB_Utils.createComment(id, content, user)

        await CommentModel.create({...comment})
        await PostModel.updateOne({id}, {$push: {comments: comment}})
        return res.status(201).send(viewComment)
    } catch (err){
        console.log(err, `=> create comment for post "/:id/comments" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)
        const totalCount = await PostModel.countDocuments({})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const posts = await postPagAndSort({}, sortBy, sortDirection, pageSize, pageNumber)
        let userId = ''
        if(req.headers.authorization) {
            const accessToken = req.headers.authorization.split(' ')[1]
            userId = getUserIdByToken(accessToken)
        }
            const viewPosts = posts.map(post => {
                console.log(1111111111)
                const newestLikes = post.extendedLikesInfo.newestLikes.map((el, i) => {
                    const {_id, ...res} = el
                    if(i < 3) return res;
                    return
                })
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
                        newestLikes: newestLikes.splice(0, 3)
                    }
                }
            })

            return res.status(200).send({
                pagesCount, page: pageNumber,
                pageSize, totalCount, items: viewPosts})

    } catch (err){
        console.log(err, `=> get all posts with sort and pagination "/" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        let {foundPost}: postT = await DB_Utils.findPost(req, res)
        if (!foundPost) return res.sendStatus(404)

        let userId = ''

        if(req.headers.authorization){
            const accessToken = req.headers.authorization.split(' ')[1]
            userId = getUserIdByToken(accessToken)
        }

        const viewPost = {
            id: foundPost.id,
            title: foundPost.title,
            shortDescription: foundPost.shortDescription,
            content: foundPost.content,
            blogId: foundPost.blogId,
            blogName: foundPost.blogName,
            createdAt: foundPost.createdAt,
            extendedLikesInfo: {
                likesCount: foundPost.extendedLikesInfo.likesCount,
                dislikesCount: foundPost.extendedLikesInfo.dislikesCount,
                myStatus: foundPost.reactions.reduce((ac, r) => {
                    if (r.userId === userId) {
                        return ac = r.status
                    }
                    return ac
                }, 'None'),
                newestLikes: foundPost.extendedLikesInfo.newestLikes.filter((el, i) => {
                    const {_id, ...res} = el
                    console.log(res)
                    if(i < 3) return res;
                    else return
                })
            }
        }


        return res.status(200).send(viewPost)
    } catch (err){
        console.log(err, `=> get post by id "/:id" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.post('/', checkAuth, ...postCreateValidation, ...blogIdValidation, checkValidation, async (req: Request, res: Response) => {
    try {
        const {title, shortDescription, content, blogId} = req.body
        const blog: blogsT = await BlogModel.findOne({id: blogId})
        if(!blog) return res.sendStatus(404)
        const newPost: postT = DB_Utils.createPost(title, shortDescription, content, blogId, blog.name)

        await PostModel.create({...newPost})
        delete newPost.comments
        delete newPost.reactions
        return res.status(201).send(newPost)
    } catch (err){
        console.log(err, `=> create post "/" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.put('/:id', checkAuth, ...postCreateValidation,...blogIdValidation, checkValidation, async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {title, shortDescription, content, blogId} = req.body
        const blog = await BlogModel.findOne({id: blogId})
        const result = await PostModel.updateOne({id},
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
    } catch (err){
        console.log(err, `=> update post (put) "/:id" postsRouter`)
        return res.sendStatus(500)
    }
})

postsRouter.put('/:id/like-status', AuthMiddleware, ...isLikeStatusCorrect, checkValidation, async (req: Request, res: Response) => {
    const {id} = req.params
    const {likeStatus} = req.body
    if(!id) return res.sendStatus(400)
    const post: postT = await PostModel.findOne({id}).lean()
    if(!post) return res.sendStatus(404)

    const userLikeStatus = post.reactions.filter(reaction => reaction.userId === req.userId)[0]
    const reaction: reactionsT = DB_Utils.createReaction(req.userId, likeStatus)
    if(!userLikeStatus && likeStatus === 'None') return res.sendStatus(204)
    if(userLikeStatus && userLikeStatus.status === likeStatus) return res.sendStatus(204)

    const user: UserAccountDBType = await UserModel.findOne({id: req.userId}).lean()
    const login = user.AccountData.username
    const newestLike: newestLikesT = DB_Utils.createNewestLike(req.userId, login)
    if(!userLikeStatus){
        if(likeStatus === 'Like'){
            await PostModel.updateOne({id}, {$push: {reactions: reaction,
                    'extendedLikesInfo.newestLikes': {$each: [newestLike], $position: 0}},
            $inc: {'extendedLikesInfo.likesCount': 1, 'extendedLikesInfo.dislikesCount': 0}})
            return res.sendStatus(204)
        } else {
            await PostModel.updateOne({id}, {$push: {reactions: reaction},
                $inc: {'extendedLikesInfo.likesCount': 0, 'extendedLikesInfo.dislikesCount': 1}})
            return res.sendStatus(204)
        }
    }
    if(userLikeStatus){
        if(userLikeStatus.status === 'Like'){
            if(likeStatus === 'Dislike'){
                await PostModel.updateOne({id, reactions: {$elemMatch: {userId: userLikeStatus.userId}}},
                    {$set: {reactions: reaction}, $inc: {'extendedLikesInfo.likesCount': -1, 'extendedLikesInfo.dislikesCount': 1}})
            } else {
                await PostModel.updateOne({id, reactions: {$elemMatch: {userId: userLikeStatus.userId}}},
                    {$pull: {reactions: {userId: userLikeStatus.userId}}, $inc: {'extendedLikesInfo.likesCount': -1}})
            }
        }

        if(userLikeStatus.status === 'Dislike'){
            if(likeStatus === 'Like'){
                await PostModel.updateOne({id, reactions: {$elemMatch: {userId: userLikeStatus.userId}}},
                {$push: {'extendedLikesInfo.newestLikes': {$each: [newestLike], $position: 0}},
                $set: {reactions: reaction}, $inc: {'extendedLikesInfo.likesCount': 1, 'extendedLikesInfo.dislikesCount': -1}})
            } else {
                await PostModel.updateOne({id, reactions: {$elemMatch: {userId: userLikeStatus.userId}}},
                    {$pull: {reactions: {userId: userLikeStatus.userId}}, $inc: {'extendedLikesInfo.dislikesCount': -1}})
            }
        }
    }

})

postsRouter.delete('/:id', checkAuth,async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const result = await PostModel.deleteOne({id})
        if(result.deletedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(404)
    } catch (err) {
        console.log(err, `=> delete "/:id" postsRouter`)
        return res.sendStatus(500)
    }
})