import {PostModel} from "./db/PostModel";
import {BlogModel} from "./db/BlogModel";
import {Request, Response} from "express";
import {commentsT, extendedLikesInfoT, postT, UserAccountDBType, reactionsT, newestLikesT} from "./types";
import * as uuid from "uuid";
import {WithId} from 'mongodb'
export const DB_Utils = {
    findBlog: async(req: Request, res: Response) => {
        const {id} = req.params
        const foundBlog = await BlogModel.findOne({id}, { projection : { _id:0 }})
        return {id, foundBlog}
    },

    findPost: async(req: Request, res: Response) => {
        const {id} = req.params
        const foundPost = await PostModel.findOne({id}, { projection : { _id:0, comments: 0}})
        return {id, foundPost}
    },

    createNewVideo: (newVideoId: number, title: string, author: string, dateNow: Date,
                     availableResolutions: ["P144" | "P240" | "P360" | "P480" | "P720" | "P1080" | "P1440" | "P2160"]) => {
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

    updateVideo: (title: string, author: string,minAgeRestriction: number,
                  availableResolutions: string[], publicationDate: string, canBeDownloaded: boolean) => {
        return {
            title: title as string,
            author: author as string,
            publicationDate,
            availableResolutions,
            canBeDownloaded,
            minAgeRestriction
        }
    },

    createPost: (title: string, shortDescription: string,
                 content: string, blogId: string, blogName: string): postT => {
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

    createComment: (id: string, content: string, user: UserAccountDBType) => {
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
    createReaction: (userId: string, status: string) => {
        return {
            userId,
            status,
            createdAt: new Date().toISOString()
        }
    },
    createNewestLike: (userId: string, login: string) => {
        return {
            userId,
            login,
            addedAt: new Date().toISOString()
        }
    },
    createViewPost: (post: postT, userId: string) => {
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
                myStatus: post.reactions.reduce((ac: string, r: reactionsT) => {
                    if (r.userId === userId) {
                        return ac = r.status
                    }
                    return ac
                }, 'None'),
                newestLikes: post.extendedLikesInfo.newestLikes.map((el: newestLikesT, i: number) => {
                    if(i < 3) {
                        return {
                            userId: el.userId,
                            addedAt: el.addedAt,
                            login: el.login
                        };
                    }
                    return
                }).splice(0, 3)
            }
        }
    },
    createViewComment: (comment: commentsT, userId: string) => {
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: comment.commentatorInfo,
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: comment.reactions.reduce((ac, r)=>{
                    if(r.userId == userId) {
                        ac = r.status;
                        return ac
                    }
                    return ac
                }, 'None')
            }
        }
}

}