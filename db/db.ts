import {MongoClient} from 'mongodb'


const mongoURI = process.env.mongoURI || 'mongodb+srv://satyxa1919:m1Satyxa2on@clusterblog.jvi7su7.mongodb.net/patreon?retryWrites=true&w=majority'

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

