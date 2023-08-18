import express, {Request, Response} from 'express'
import {videosRouter} from "./routes/videos";
import {db} from "./db";

const app = express();
const port = process.env.PORT || 5200
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})
app.use(express.json());
app.use('/videos', videosRouter)

app.delete('/testing/all-data', (req: Request, res: Response) => {
  db.videos = []
  res.sendStatus(204)
})

app.listen(port, () => {
  console.log( 'server 5200 ok')
})

