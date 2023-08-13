
import {Router, Response, Request} from "express";

export const videosRouter = Router({})
type videoT = {
  id: string
  title: string
  description: string
}
const videos: Array<videoT> = [
  {id: '1', title: 'hi', description: 'my first video'},
  {id: '2', title: 'hihi', description: 'my second video'},
  {id: '3', title: 'hihihi', description: 'my third video'}
]
videosRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send(videos)
})

videosRouter.post('/', (req: Request, res: Response) => {
  const {title, description, id} = req.body
  const createdVideo = {
    id,
    title,
    description
  }
  videos.push(createdVideo)
  res.status(200).send({videos, createdVideo})
})

videosRouter.put('/:id', (req: Request, res: Response) => {
  const {id} = req.params
  const video:Array<videoT> = videos.filter((item) => item.id === id)
  if(video){
    video[0].title = req.body.title
    res.status(200).send({videos, video})
  } else {
    res.status(404)
  }
})

videosRouter.delete('/:id', (req: Request, res: Response) => {
  const {id} = req.params
  const filterVideos = videos.filter((v) => v.id !== id)
  res.status(204).send(filterVideos)
})
