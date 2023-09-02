import express, { Request, Response} from 'express'
import { videosRouter} from "./routes/videos";
import {blogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";
import {patreonPosts, patreonBlogs, patreonVideos, patreonUsers, patreonComments, runDB} from './db/db'
import {usersRouter} from "./routes/users";
import {loginRouter} from "./routes/login";
import {commentsRouter} from "./routes/comments";

const app = express();
const port = process.env.PORT || 5200
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})


app.use(express.json());
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', loginRouter)
app.use('/comments', commentsRouter)

app.delete('/testing/all-data', async(req: Request, res: Response) => {
  await patreonBlogs.deleteMany({})
  await patreonPosts.deleteMany({})
  await patreonVideos.deleteMany({})
  await patreonUsers.deleteMany({})
  await patreonComments.deleteMany({})
  return res.sendStatus(204)
})
const startApp = async () => {
  await runDB()
  app.listen(port, () => {
    console.log( 'server 5200 ok')
  })
}

startApp()


