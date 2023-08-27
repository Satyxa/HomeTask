import {Router, Response, Request} from "express";
import {patreonVideos} from "../db/db";
import {videoT, ValidationErrorType, updatedVideoType} from "../types";
import {createVideoValidation, updateVideoValidation} from "../validation";

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await patreonVideos.find({}).toArray()
  res.status(200).send(videos)
})

videosRouter.get('/:id', async(req: Request, res: Response) => {
  const id = +req.params.id
  const video = await patreonVideos.find({id}).toArray()
  if(!video) {res.sendStatus(404)}
  else{res.status(200).send(video)}
})

videosRouter.post('/',  async (req: Request, res: Response) => {
  const {title, author, availableResolutions} = req.body
  const errors: ValidationErrorType[] = []
  errors.push(...createVideoValidation(title, author, availableResolutions))
  if(errors.length){
    return res.status(400).send({
      errorsMessages: errors
    })
  }

  const dateNow = new Date()

  const newVideo: videoT = {
    id: 11,
    title,
    author,
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: dateNow.toISOString(),
    publicationDate: new Date(dateNow.setDate(dateNow.getDate() + 1)).toISOString(),
    availableResolutions
  }

  await patreonVideos.insertOne(newVideo)
  return res.status(201).send(newVideo)
})

videosRouter.put('/:id', async (req: Request, res: Response) => {
  const id = +req.params.id
  const {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
  const video = await patreonVideos.find({id}).toArray()
  if(!video) res.sendStatus(404)

  const errors: ValidationErrorType[] = []

  errors.push(...updateVideoValidation(canBeDownloaded, minAgeRestriction, publicationDate))
  errors.push(...createVideoValidation(title, author, availableResolutions))
  const dateNow = new Date()

  if(errors.length){
    return res.status(400).send({
      errorsMessages: errors
    })
  }

  const updatedVideo: updatedVideoType = {
    id: +id as number,
    title: title as string,
    author: author as string,
    createdAt: video[0].createdAt,
    publicationDate,
    availableResolutions,
    canBeDownloaded,
    minAgeRestriction
  }
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
