import {MongoClient} from 'mongodb'
import {blogsT, postT, videoT, userT, commentsT, UserAccountDBType, RateLimiterT} from "../types";
import mongoose from "mongoose";

const mongoURI = process.env.MONGOURI || 'mongodb+srv://satyxa1919:m1Satyxa2on@clusterblog.jvi7su7.mongodb.net/patreon?retryWrites=true&w=majority'

export const client = new MongoClient(mongoURI)

export async function runDB() {
    try{
        await mongoose.connect(mongoURI)
        console.log('db connect')
    } catch (err){
        console.log('db no connection' + err)
        await mongoose.disconnect()
    }
}


