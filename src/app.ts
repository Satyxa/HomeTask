import express, { Request, Response} from 'express'
import {videosRouter} from "./routes/videos";
import {blogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";
import {usersRouter} from "./routes/users";
import {loginRouter} from "./routes/login";
import {commentsRouter} from "./routes/comments";
import {registrationRouter} from "./routes/registration";
import {emailRouter} from "./routes/email";
import cookieParser from "cookie-parser";
import {devicesRouter} from "./routes/devices";
import {BlogModel} from "./db/BlogModel";
import {PostModel} from "./db/PostModel";
import {VideoModel} from "./db/VideoModel";
import {UserModel} from "./db/UserModel";
import {CommentModel} from "./db/CommentModel";
import {RateLimitModel} from "./db/rateLimitModel";
import {runDB} from "./db/db";
const app = express();
const port = process.env.PORT || 5200
app.get('/', (req: Request, res: Response) => res.send('privet'))
app.set('trust proxy', true)

app.use(express.json());
app.use(cookieParser())
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', loginRouter)
app.use('/auth', registrationRouter)
app.use('/auth', emailRouter)
app.use('/comments', commentsRouter)
app.use('/security/devices', devicesRouter)

app.delete('/testing/all-data', async(req: Request, res: Response) => {
  await BlogModel.deleteMany({})
  await PostModel.deleteMany({})
  await VideoModel.deleteMany({})
  await UserModel.deleteMany({})
  await CommentModel.deleteMany({})
  await RateLimitModel.deleteMany({})
  return res.sendStatus(204)
})

app.delete('/testing/delete-users', async(req: Request, res: Response) => {
  await UserModel.deleteMany({})
  return res.sendStatus(204)
})
const startApp = async () => {
  await runDB()
  app.listen(port, () => console.log( 'server 5200 ok'))
}

startApp()


