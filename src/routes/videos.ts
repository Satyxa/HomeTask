import {Router, Response, Request} from "express";
import {patreonVideos} from "../db/db";
import {videoT, ValidationErrorType, updatedVideoType} from "../types";
import {checkValidation, createVideoValidation, getResultValidation, updateVideoValidation} from "../validation";
import {DB_Utils} from "../DB-utils";

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await patreonVideos.find({}).toArray()
  res.status(200).send(videos)
})

videosRouter.get('/:id', async(req: Request, res: Response) => {
  const id = +req.params.id
  const video = await patreonVideos.findOne({id})
  if(!video) return res.sendStatus(404)
  else return res.status(200).send(video)
})

videosRouter.post('/',  ...createVideoValidation,checkValidation, async (req: Request, res: Response) => {
  const {title, author, availableResolutions} = req.body

  const dateNow = new Date()
  const newVideoId = await patreonVideos.countDocuments({})
  const newVideo: videoT = DB_Utils.createNewVideo(newVideoId, title, author, dateNow, availableResolutions)

  await patreonVideos.insertOne(newVideo)
  return res.status(201).send(newVideo)
})

videosRouter.put('/:id', ...updateVideoValidation,checkValidation, async (req: Request, res: Response) => {
  const dateNow = new Date()
  const id = +req.params.id
  if(!await patreonVideos.findOne({id})) res.sendStatus(404)

  const {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body

  const updatedVideo: updatedVideoType = DB_Utils.updateVideo(
      title, author,minAgeRestriction,
      availableResolutions, publicationDate, canBeDownloaded)

  const result = await patreonVideos.updateOne({id}, updatedVideo)

  if(result.matchedCount === 1) {return res.sendStatus(204)}
  else {return res.sendStatus(400)}
})

videosRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = +req.params.id
  const result = await patreonVideos.deleteOne({id})

  if(result.deletedCount === 1){res.sendStatus(204)}
  else {res.sendStatus(404)}
})
