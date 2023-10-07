import mongoose from "mongoose";
import {WithId} from "mongodb";
import {videoT} from "../types";

export const VideoSchema = new mongoose.Schema<WithId<videoT>>({
    id: Number,
    title: String,
    author: String,
    canBeDownloaded: Boolean,
    minAgeRestriction: Number,
    createdAt: Date,
    publicationDate: Date,
    availableResolutions: [String]
})

export const VideoModel = mongoose.model('videos', VideoSchema)