import bodyParser from "body-parser";
import express from 'express'
import {videosRouter} from "./routes/videos";

const app = express();
app.use(bodyParser.json());
app.use('/videos', videosRouter)

app.listen(5200, () => {
  console.log( 'err')
})

