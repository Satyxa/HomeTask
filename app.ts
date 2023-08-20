import express, {Request, Response} from 'express'
import {videosRouter} from "./routes/videos";
import {db} from "./db";
import {blogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";

const app = express();
const port = process.env.PORT || 5200
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})
app.use(express.json());
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.delete('/testing/all-data', (req: Request, res: Response) => {
  db.videos = []
  db.blogs = []
  db.posts = []
  res.sendStatus(204)
})

app.listen(port, () => {
  console.log( 'server 5200 ok')
})

