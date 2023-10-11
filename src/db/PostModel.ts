import mongoose from "mongoose";
import {WithId} from "mongodb";
import {postT} from "../types";

export const PostSchema = new mongoose.Schema<WithId<postT>>({
    id: String,
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: Date,
    comments: [{
        id: String,
        content: String,
        createdAt: Date,
        postId: String,
        commentatorInfo: {
            userId: String,
            userLogin: String
        }
    }],
    extendedLikesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        myStatus: String,
        newestLikes: [{
            addedAt: Date,
            userId: String,
            login: String
        }],
    },
    reactions: [{
        userId: String,
        status: String,
        createdAt: Date
    }]
})

export const PostModel = mongoose.model('posts', PostSchema)