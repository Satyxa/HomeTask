import {Request, Response, Router} from "express";
import {patreonUsers} from "../db/db";
import {userT} from "../types";
import {createUser} from "../autentification";

export const usersRouter = Router({});


usersRouter.get('/', async (req: Request, res: Response) => {
  const users = await patreonUsers
      .find({}, {projection: {_id: 0,passwordHash: 0, passwordSalt: 0}})
      .toArray()
  res.status(200).send(users)
})

usersRouter.post('/', async(req: Request, res: Response) => {
  const {email, login, password} = req.body
  const newUser: userT = await createUser(login, email, password)
  await patreonUsers.insertOne({...newUser})
  const viewUser = {
    id: newUser.id,
    login: newUser.username,
    email: newUser.email,
    createdAt: newUser.createdAt
  }
  return res.status(201).send(viewUser)
})

usersRouter.delete('/:id', async(req: Request, res: Response) => {
  const id = req.query.id
  const result = await patreonUsers.deleteOne({id})
  if(result.deletedCount === 1){ return res.sendStatus(204)}
  else {return res.sendStatus(404)}
})

