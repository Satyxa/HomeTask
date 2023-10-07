import mongoose from "mongoose";
import {WithId} from "mongodb";
import {commentsT} from "../types";

export const CommentSchema = new mongoose.Schema<WithId<commentsT>>({
    id: String,
    content: String,
    createdAt: Date,
    postId: String,
    commentatorInfo: {
        userId: String,
        userLogin: String
    }
})

export const CommentModel = mongoose.model('comments', CommentSchema)