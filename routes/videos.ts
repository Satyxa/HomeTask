
import {Router, Response, Request} from "express";
import {client} from "../db/db";

export type ValidationErrorType = {
  message: string
  field: string
}



export const videosRouter = Router({})
export type videoT = {
  id: number
  title: string
  author: string
  canBeDownloaded: boolean
  minAgeRestriction: number | null
  createdAt: string
  publicationDate: string
  availableResolutions: Array<'P144' | 'P240' | 'P360' | 'P480' | 'P720' | 'P1080' | 'P1440' | 'P2160'>
}
const patreonVideos = client.db('patreon').collection<videoT>('videos')
const AvRes = [
  'P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'
]

const createVideoValidation = (title: string, author: string,
                               availableResolutions: Array<string>) => {
  const errors: ValidationErrorType[] = []
  if(!title || !title.trim() || title.length > 40 ) {
    errors.push({message: 'invalid title', field: 'title'})
  }
  if(!author || !author.trim() || author.length > 20)  {
    errors.push({message: 'invalid author', field: 'author'})
  }

  if(!availableResolutions) {
    errors.push({message: 'invalid availableResolutions', field: 'availableResolutions'})
  } else if(availableResolutions){
    if(availableResolutions[1] === "Invalid"){
      errors.push({message: 'invalid avail222ableResolutions', field: 'availableResolutions'})
    }
  }
  return errors
}

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await patreonVideos.find({}).toArray()
  res.status(200).send(videos)
})
// @ts-ignore
videosRouter.get('/:id', async(req: Request, res: Response) => {
  const {id} = req.params
  // @ts-ignore
  const video = await patreonVideos.find({id}).toArray()
  if(!video) {
    res.sendStatus(404)
  } else{
    res.status(200).send(video)
  }
})
// @ts-ignore
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
  const {id} = req.params
  const {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
  //@ts-ignore
  const video = await patreonVideos.find({id})
  if(!video) {
    res.sendStatus(404)
  }
  const errors: ValidationErrorType[] = []

  if(canBeDownloaded === undefined || typeof canBeDownloaded !== "boolean"){
    errors.push({message: 'invalid canBeDownloaded', field: 'canBeDownloaded'})
  }
  if(!minAgeRestriction || typeof minAgeRestriction !== "number" || minAgeRestriction > 18 || minAgeRestriction < 1){
    errors.push({message: 'invalid minAgeRestriction', field: 'minAgeRestriction'})
  }
  if(!publicationDate || typeof publicationDate !== "string"){
    errors.push({message: 'invalid publicationDate', field: 'publicationDate'})
  }

  errors.push(...createVideoValidation(title, author, availableResolutions))
  const dateNow = new Date()

  if(errors.length){
    return res.status(400).send({
      errorsMessages: errors
    })
  }
// @ts-ignore
// @ts-ignore
// @ts-ignore
  type updatedVideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<string>
  }
// @ts-ignore
  const updatedVideo: updatedVideoType = {
    id: +id as number,
    title: title as string,
    author: author as string,
    canBeDownloaded,
    minAgeRestriction,
    // @ts-ignore
    createdAt: video.createdAt,
    publicationDate,
    availableResolutions

  }
  // @ts-ignore
  // @ts-ignore
  const result = await patreonVideos.updateOne({id}, updatedVideo)
  if(result.matchedCount === 1) {
    return res.sendStatus(204)
  } else {
    return res.sendStatus(400)
  }
})

videosRouter.delete('/:id', async (req: Request, res: Response) => {
  const {id} = req.params
  //@ts-ignore
  const result = await patreonVideos.deleteOne({id})
  if(result.deletedCount === 1){
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
//
})
