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
    },
    likesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        myStatus: String
    },
    reactions: [{
        userId: String,
        status: String,
        createdAt: String
    }]
})

export const CommentModel = mongoose.model('comments', CommentSchema)

// const reaction = {
//     userId: '1',
//     status: 'Like',
//     createdAt: 'String'
// }
// //get comment
// const reactions = []
//
// const existedReaction = reactions.find(el => el.userId === reaction.status)
// if(!existedReaction)
//
//
//
// const getLikesInfo = (reactions: {
//     userId: string,
//     status: string,
//     createdAt: string
// }[], userId: string | null) => {
//     let likesCount = 0
//     let dislikesCount = 0
//     let myStatus = 'None'
//     for (const reaction of reactions) {
//         if(reaction.status === 'Like') likesCount++
//         if(reaction.status === 'Dislike') dislikesCount++
//         if(reaction.userId === userId) myStatus = reaction.status
//     }
// }
//
// const {likesCount, dislikesCount, myStatus} = reactions.forEach((el, i) => {
//
//     return {likesCount, dislikesCount, myStatus}
// })