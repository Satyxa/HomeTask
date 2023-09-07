import {MongoClient} from 'mongodb'
import {blogsT, postT, videoT, userT, commentsT, UserAccountDBType} from "../types";


const mongoURI = process.env.MONGOURI || 'mongodb+srv://satyxa1919:m1Satyxa2on@clusterblog.jvi7su7.mongodb.net/patreon?retryWrites=true&w=majority'

export const client = new MongoClient(mongoURI)

export async function runDB() {
    try{
        await client.connect()
        await client.db('shop').command({ping: 1})
        console.log('db connect')
    } catch (err){
        console.log(err)
        await client.close()
    }
}

export const patreonPosts = client.db('patreon').collection<postT>('posts')
export const patreonVideos = client.db('patreon').collection<videoT>('videos')
export const patreonBlogs = client.db('patreon').collection<blogsT>('blogs')
export const patreonUsers = client.db('patreon').collection<UserAccountDBType>('users')
export const patreonComments = client.db('patreon').collection<commentsT>('comments')
export const patreonIvalidTokens = client.db('patreon').collection<string[]>('tokens')

