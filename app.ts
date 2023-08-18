import bodyParser from "body-parser";
import express, {Request, Response} from 'express'
import {videosRouter} from "./routes/videos";

const app = express();
const port = process.env.PORT || 5200
app.get('/', async (req: Request, res: Response) => {
  await res.send('privet')
})
app.use(bodyParser.json());
app.use('/hometask_01/api/videos', videosRouter)



app.listen(port, () => {
  console.log( 'server 5200 ok')
})

