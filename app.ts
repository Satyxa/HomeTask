import express, { Request, Response} from 'express'
import { videosRouter} from "./routes/videos";
import {runDB} from "./db/db";
import {blogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";
import {patreonBlogs} from './routes/blogs'
import {patreonPosts} from './routes/posts'
import {patreonVideos} from './routes/videos'

const app = express();
const port = process.env.PORT || 5200
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})


app.use(express.json());
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.delete('/testing/all-data', async(req: Request, res: Response) => {
  await patreonBlogs.deleteMany({})
  await patreonPosts.deleteMany({})
  await patreonVideos.deleteMany({})
  res.sendStatus(204)
})


const startApp = async () => {
  await runDB()
  return app.listen(port, () => {
    console.log( 'server 5200 ok')
  })
}

startApp()


