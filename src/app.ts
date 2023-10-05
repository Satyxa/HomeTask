import express, { Request, Response} from 'express'
import {videosRouter} from "./routes/videos";
import {blogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";
import {patreonPosts, patreonBlogs, patreonVideos, patreonUsers, patreonComments, runDB} from './db/db'
import {usersRouter} from "./routes/users";
import {loginRouter} from "./routes/login";
import {commentsRouter} from "./routes/comments";
import {registrationRouter} from "./routes/registration";
import {emailRouter} from "./routes/email";
import cookieParser from "cookie-parser";
import {devicesRouter} from "./routes/devices";
import {rateLimit} from 'express-rate-limit';
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

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})

app.use('/auth/', limiter)

app.delete('/testing/all-data', async(req: Request, res: Response) => {
  await patreonBlogs.deleteMany({})
  await patreonPosts.deleteMany({})
  await patreonVideos.deleteMany({})
  await patreonUsers.deleteMany({})
  await patreonComments.deleteMany({})
  return res.sendStatus(204)
})

app.delete('/testing/delete-users', async(req: Request, res: Response) => {
  await patreonUsers.deleteMany({})
  return res.sendStatus(204)
})
const startApp = async () => {
  await runDB()
  app.listen(port, () => console.log( 'server 5200 ok'))
}

startApp()


