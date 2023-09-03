import {NextFunction, Request, Response, Router} from "express";
import {patreonUsers} from "../db/db";
import {userT} from "../types";
import {createUser} from "../autentification";
import {Filter} from "mongodb";
import {paginationSort, usersPagAndSort} from "../PaginationAndSort";
import {checkAuth, checkValidation, usersValidation} from "../validation";

export const usersRouter = Router({})

usersRouter.get('/',async (req: Request, res: Response) => {
  const {pageNumber, pageSize, sortBy, searchLoginTerm, searchEmailTerm, sortDirection} = await paginationSort(req)
  const filter: Filter<userT> = {$or: [{login: {$regex: searchLoginTerm ?? '', $options: 'i'}}, {email: {$regex: searchEmailTerm ?? '', $options: 'i'}}]}
  const totalCount = await patreonUsers.countDocuments(filter)
  const pagesCount = Math.ceil(totalCount / pageSize)

  const users = await usersPagAndSort(filter, sortBy, sortDirection, pageSize, pageNumber)
  return res.status(200).send({
    pagesCount, page: pageNumber, pageSize,
    totalCount, items: users})
})

usersRouter.post('/', usersValidation,checkValidation, checkAuth, async(req: Request, res: Response) => {
  const {email, login, password} = req.body
  if(!email || !login || !password) return res.sendStatus(400)

  const newUser: userT = await createUser(login, email, password)
  await patreonUsers.insertOne({...newUser})

  const viewUser = {
    id: newUser.id,
    login: newUser.login,
    email: newUser.email,
    createdAt: newUser.createdAt
  }
  return res.status(201).send(viewUser)
})

usersRouter.delete('/:id',checkAuth, async(req: Request, res: Response) => {
  const id = req.params.id
  const result = await patreonUsers.deleteOne({id})
  if(result.deletedCount === 1){ return res.sendStatus(204)}
  else {return res.sendStatus(404)}
})

