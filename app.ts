import bodyParser from "body-parser";
import express, {Request, Response} from 'express'
import {videosRouter} from "./routes/videos";

const app = express();
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})
app.use(bodyParser.json());
app.use('/hometask_01/api/videos', videosRouter)

app.delete('/ht_01/api/testing/all-data', (req: Request, res: Response) => {
  videosRouter.videos = []
  res.sendStatus(204)
})


app.listen(5200, () => {
  console.log( 'server 5200 ok')
})

