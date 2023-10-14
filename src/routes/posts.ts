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
import {Filter, WithId} from "mongodb";
import {DB_Utils} from "../DB-utils";
import {getUserIdByToken} from "../authentication";

const postsController = {
    // COMMENTS
    getCommentsForOnePost: async (req: Request, res: Response) => {
        try {
            const id = req.params.id
            const {pageNumber, pageSize, sortBy, sortDirection} = await paginationSort(req)
            const filter = {postId: id}
            const totalCount = await CommentModel.countDocuments(filter)
            const pagesCount = Math.ceil(totalCount / pageSize)

            if (!await PostModel.findOne({id}))return res.sendStatus(404)

            const comments = await commentsPagAndSort(filter, sortBy, sortDirection, pageSize, pageNumber)
            let userId: string = '';
            if(req.headers.authorization) {
                const accessToken = req.headers.authorization.split(' ')[1]
                userId = getUserIdByToken(accessToken)
            }
            const viewComments = comments.map(comment => (DB_Utils.createViewComment(comment, userId)))

            return res.status(200).send({
                    pagesCount, page: +pageNumber,
                    pageSize, totalCount, items: viewComments})

        } catch (err){
            console.log(err, `=> get "/:id/comments" postsRouter`)
            return res.sendStatus(500)
        }
    },
    createCommentForPost: async (req: Request, res: Response) => {
        try {
            const id = req.params.id
            const content: string = req.body.content

            if(!await PostModel.findOne({id})) return res.sendStatus(404)
            const user: UserAccountDBType | null = await UserModel.findOne({id: req.userId!})
            if(!user)return res.sendStatus(404)

            const {comment, viewComment} = DB_Utils.createComment(id, content, user)

            await CommentModel.create({...comment})
            await PostModel.updateOne({id}, {$push: {comments: comment}})
            return res.status(201).send(viewComment)
        } catch (err){
            console.log(err, `=> create comment for post "/:id/comments" postsRouter`)
            return res.sendStatus(500)
        }
    },
    // COMMENTS
    // POSTS
    getAllPosts: async (req: Request, res: Response) => {
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
                return DB_Utils.createViewPost(post, userId)
            })
            return res.status(200).send({
                pagesCount, page: pageNumber,
                pageSize, totalCount, items: viewPosts})

        } catch (err){
            console.log(err, `=> get all posts with sort and pagination "/" postsRouter`)
            return res.sendStatus(500)
        }
    },
    getOnePost: async (req: Request, res: Response) => {
        try {
            let {foundPost} = await DB_Utils.findPost(req, res)
            if (!foundPost) return res.sendStatus(404)

            let userId = ''
            if(req.headers.authorization){
                const accessToken = req.headers.authorization.split(' ')[1]
                userId = getUserIdByToken(accessToken)
            }

            const viewPost = DB_Utils.createViewPost(foundPost, userId)
            return res.status(200).send(viewPost)
        } catch (err){
            console.log(err, `=> get post by id "/:id" postsRouter`)
            return res.sendStatus(500)
        }
    },
    createPost: async (req: Request, res: Response) => {
        try {
            const {title, shortDescription, content, blogId} = req.body
            const blog: blogsT | null = await BlogModel.findOne({id: blogId})
            if(!blog) return res.sendStatus(404)
            const newPost: postT = DB_Utils.createPost(title, shortDescription, content, blogId, blog.name)

            await PostModel.create({...newPost})
            const {comments, reactions, ...post} = newPost

            return res.status(201).send(post)
        } catch (err){
            console.log(err, `=> create post "/" postsRouter`)
            return res.sendStatus(500)
        }
    },
    updatePost: async (req: Request, res: Response) => {
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
    },
    updatePostLikeStatus: async (req: Request, res: Response) => {
        const {id} = req.params
        const {likeStatus} = req.body
        if(!id) return res.sendStatus(400)
        const post: postT | null = await PostModel.findOne({id}).lean()
        if(!post) return res.sendStatus(404)

        const userLikeStatus = post.reactions.filter(reaction => reaction.userId === req.userId!)[0]
        const reaction: reactionsT = DB_Utils.createReaction(req.userId!, likeStatus)
        if(!userLikeStatus && likeStatus === 'None') return res.sendStatus(204)
        if(userLikeStatus && userLikeStatus.status === likeStatus) return res.sendStatus(204)

        const user: UserAccountDBType | null = await UserModel.findOne({id: req.userId!}).lean()
        if(!user) return res.sendStatus(401)
        const login = user.AccountData.username
        const newestLike: newestLikesT = DB_Utils.createNewestLike(req.userId!, login)

        const updateNewestLikes = {$each: [newestLike], $position: 0}
        const setReaction = {reactions: reaction}

        if(!userLikeStatus){
            if(likeStatus === 'Like'){
                await PostModel.updateOne({id}, {
                    $push: {setReaction, 'extendedLikesInfo.newestLikes': updateNewestLikes},
                    $inc: {'extendedLikesInfo.likesCount': 1}
                    })
            } else {
                await PostModel.updateOne({id}, {
                    $push: setReaction,
                    $inc: {'extendedLikesInfo.dislikesCount': 1}
                })
            }
            return res.sendStatus(204)
        }

        if(userLikeStatus){
            const pullReaction = {reactions: {userId: userLikeStatus.userId}}
            const findByUserId = {userId: userLikeStatus.userId}
            const filterForUpdate = {id, reactions: {$elemMatch: findByUserId}}
            if(userLikeStatus.status === 'Like'){
                if(likeStatus === 'Dislike'){
                    await PostModel.updateOne(filterForUpdate,
                        {
                            $set: setReaction,
                            $pull: {'extendedLikesInfo.newestLikes': findByUserId},
                            $inc: {
                                'extendedLikesInfo.likesCount': -1,
                                'extendedLikesInfo.dislikesCount': 1}
                        })
                } else {
                    await PostModel.updateOne(filterForUpdate,
                        {
                            $pull: {pullReaction, 'extendedLikesInfo.newestLikes': findByUserId},
                            $inc: {'extendedLikesInfo.likesCount': -1}
                        })
                }
            }

            if(userLikeStatus.status === 'Dislike'){
                if(likeStatus === 'Like'){
                    await PostModel.updateOne(filterForUpdate,
                        {
                            $push: {'extendedLikesInfo.newestLikes': updateNewestLikes},
                            $set: setReaction,
                            $inc: {
                                'extendedLikesInfo.likesCount': 1,
                                'extendedLikesInfo.dislikesCount': -1}
                        })
                } else {
                    await PostModel.updateOne(filterForUpdate,
                        {
                            $pull: pullReaction,
                            $inc: {'extendedLikesInfo.dislikesCount': -1}
                        })
                }
            }
            return res.sendStatus(204)
        }
    },
    deletePost: async (req: Request, res: Response) => {
        try {
            const {id} = req.params
            const result = await PostModel.deleteOne({id})
            if(result.deletedCount === 1) return res.sendStatus(204)
            else return res.sendStatus(404)
        } catch (err) {
            console.log(err, `=> delete "/:id" postsRouter`)
            return res.sendStatus(500)
        }
    }
    // POSTS
}

//await PostModel.updateOne({id, reactions: {$elemMatch: {userId: userLikeStatus.userId}}},
//                         {$push: {'extendedLikesInfo.newestLikes': {$each: [newestLike], $position: 0}},
//                             $set: {reactions: reaction}, $inc: {'extendedLikesInfo.likesCount': 1, 'extendedLikesInfo.dislikesCount': -1}})


export const postsRouter = Router({})

postsRouter.get('/:id/comments', postsController.getCommentsForOnePost)

postsRouter.post('/:id/comments',AuthMiddleware, ...commentValidator, checkValidation, postsController.createCommentForPost)

postsRouter.get('/', postsController.getAllPosts)

postsRouter.get('/:id', postsController.getOnePost)

postsRouter.post('/', checkAuth, ...postCreateValidation, ...blogIdValidation, checkValidation, postsController.createPost)

postsRouter.put('/:id', checkAuth, ...postCreateValidation,...blogIdValidation, checkValidation, postsController.updatePost)

postsRouter.put('/:id/like-status', AuthMiddleware, ...isLikeStatusCorrect, checkValidation, postsController.updatePostLikeStatus)

postsRouter.delete('/:id', checkAuth, postsController.deletePost)