import {RateLimitModel} from "./db/rateLimitModel";
import {addSeconds} from "date-fns";

export const rateLimiter = async (req, res, next) => {
    const ip = req.ip
    const timeNow = new Date()
    const url = req.originalUrl

    const countOfConnections = await RateLimitModel.countDocuments({ip, url, date: {$gte: addSeconds(timeNow, -10)}})

    await RateLimitModel.create({ip, url, date: timeNow})
    if(countOfConnections + 1 > 5) return res.sendStatus(429)
    return next()
}