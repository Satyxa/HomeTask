import mongoose from "mongoose";
import {WithId} from "mongodb";
import {blogsT} from "../types";

export const BlogSchema = new mongoose.Schema<WithId<blogsT>>({
    id: String,
    name: String,
    description: String,
    websiteUrl: String,
    isMembership: Boolean,
    createdAt: Date,
})

export const BlogModel = mongoose.model('blogs', BlogSchema)