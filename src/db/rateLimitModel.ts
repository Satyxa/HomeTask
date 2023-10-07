import mongoose from "mongoose";
import {WithId} from "mongodb";
import {rateLimitT} from "../types";

export const RateLimitSchema = new mongoose.Schema<WithId<rateLimitT>>({
    ip: String,
    url: String,
    date: Date
})

export const RateLimitModel = mongoose.model('rateLimits', RateLimitSchema)