
import {Router, Response, Request} from "express";
import {db} from "../db";

type ValidationErrorType = {
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
  availableResolutions: Array<string>
}

const createVideoValidation = (title: string, author: string,
                               availableResolutions: Array<string>) => {
  const errors: ValidationErrorType[] = []
  if(!title || !title.trim() || title.length > 40) {
    errors.push({message: 'invalid title', field: 'title'})
  }
  if(!author || !title.trim() || title.length > 20) {
    errors.push({message: 'invalid author', field: 'author'})
  }

  if(!availableResolutions) {
    errors.push({message: 'invalid availableResolutions', field: 'availableResolutions'})
  }
  return errors
}

videosRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send(db.videos)
})
videosRouter.get('/:id', (req: Request, res: Response) => {
  const {id} = req.params
  const video = db.videos.find(v => v.id === +id)
  if(!video) {
    res.sendStatus(404)
  } else{
    res.status(200).send(video)
  }
})

videosRouter.post('/',  (req: Request, res: Response) => {
  const {title, author, availableResolutions} = req.body
  console.log(availableResolutions)
  const errors: ValidationErrorType[] = []
  errors.push(...createVideoValidation(title, author, availableResolutions))
  if(errors.length){
    return res.status(400).send({
      errorsMessages: errors
    })
  }

  const dateNow = new Date()

  const newVideo: videoT = {
    id: db.videos.length + 1,
    title,
    author,
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: dateNow.toISOString(),
    publicationDate: new Date(dateNow.setDate(dateNow.getDate() + 1)).toISOString(),
    availableResolutions
  }

  db.videos.push(newVideo)
  return res.status(201).send(newVideo)
})

videosRouter.put('/:id', (req: Request, res: Response) => {
  const {id} = req.params
  const {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
  let video = db.videos.find(v => v.id === +id)
  if(!video) return res.sendStatus(404)

  const errors: ValidationErrorType[] = []

  if(!canBeDownloaded || typeof canBeDownloaded !== "boolean"){
    return errors.push({message: 'invalid canBeDownloaded', field: 'canBeDownloaded'})
  }
  if(!minAgeRestriction || typeof minAgeRestriction !== "number"){
    return errors.push({message: 'invalid minAgeRestriction', field: 'minAgeRestriction'})
  }
  if(!publicationDate || typeof publicationDate !== "string"){
    return errors.push({message: 'invalid canBeDownloaded', field: 'canBeDownloaded'})
  }

  errors.push(...createVideoValidation(title, author, availableResolutions))



  if(errors.length){
    return res.status(400).send({
      errorsMessages: errors
    })
  }
  return res.sendStatus(204)
})

videosRouter.delete('/:id', (req: Request, res: Response) => {
  const {id} = req.params
  let video = db.videos.find(v => v.id === +id)
  if(!video) {
   res.sendStatus(404)
    return
  } else if(video){
    db.videos = db.videos.filter((v:videoT) => v.id !== video?.id)
    res.sendStatus(204)
  }

//
})
