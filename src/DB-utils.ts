import {PostModel} from "./db/PostModel";
import {BlogModel} from "./db/BlogModel";
import {Request, Response} from "express";
import {commentsT, extendedLikesInfoT, postT} from "./types";
import * as uuid from "uuid";

export const DB_Utils = {
    findBlog: async(req: Request, res: Response) => {
        const {id} = req.params
        const foundBlog = await BlogModel.findOne({id}, { projection : { _id:0 }})
        return {id, foundBlog}
    },

    findPost: async(req: Request, res: Response) => {
        const {id} = req.params
        const foundPost = await PostModel.findOne({id}, { projection : { _id:0, comments: 0, 'extendedLikesInfo.newestLikes': 3 }})
        return {id, foundPost}
    },

    createNewVideo: (newVideoId, title, author, dateNow, availableResolutions) => {
        return {
            id: newVideoId,
            title,
            author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: dateNow.toISOString(),
            publicationDate: new Date(dateNow.setDate(dateNow.getDate() + 1)).toISOString(),
            availableResolutions
        }
    },

    updateVideo: (title, author,minAgeRestriction, availableResolutions, publicationDate, canBeDownloaded) => {
        return {
            title: title as string,
            author: author as string,
            publicationDate,
            availableResolutions,
            canBeDownloaded,
            minAgeRestriction
        }
    },

    createPost: (title, shortDescription, content, blogId, blogName): postT => {
        return {
            id: uuid.v4(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt: new Date().toISOString(),
            comments: [],
            reactions: [],
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    },

    createComment: (id, content, user) => {
        const comment: commentsT = {
            id: uuid.v4(),
            postId: id,
            content,
            createdAt: new Date().toISOString(),
            commentatorInfo: {
                userId: user.id,
                userLogin: user.AccountData.username
            },
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            },
            reactions: []
        }
        const viewComment = {
            content: comment.content,
            commentatorInfo: comment.commentatorInfo,
            createdAt: comment.createdAt,
            id: comment.id,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            }
        }
        return {viewComment, comment}
    },
    createReaction: (userId, status) => {
        return {
            userId,
            status,
            createdAt: new Date().toISOString()
        }
    },
    createNewestLike: (userId, login) => {
        return {
            userId,
            login,
            addedAt: new Date().toISOString()
        }
    }
}