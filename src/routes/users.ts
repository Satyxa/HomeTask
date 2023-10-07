import {NextFunction, Request, Response, Router} from "express";
import {UserModel} from "../db/UserModel";
import {UserAccountDBType, userT} from "../types";
import {createUser} from "../authentication";
import {Filter} from "mongodb";
import {paginationSort, usersPagAndSort} from "../PaginationAndSort";
import {checkAuth, checkValidation, usersValidation} from "../validation";

export const usersRouter = Router({})

usersRouter.get('/',async (req: Request, res: Response) => {
  try {
    const {pageNumber, pageSize, sortBy, searchLoginTerm, searchEmailTerm, sortDirection} = await paginationSort(req)
    const filter: Filter<userT> = {$or: [{'AccountData.username': {$regex: searchLoginTerm ?? '', $options: 'i'}}, {'AccountData.email': {$regex: searchEmailTerm ?? '', $options: 'i'}}]}
    const totalCount = await UserModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const users = await usersPagAndSort(filter, sortBy, sortDirection, pageSize, pageNumber)
    return res.status(200).send({
      pagesCount, page: pageNumber, pageSize,
      totalCount, items: users})
  }catch (err){
    console.log(err, `=> get All "/" usersRouter`)
    return null
  }
})

usersRouter.post('/', checkAuth, ...usersValidation,checkValidation,  async(req: Request, res: Response) => {
  try {
    const {email, login, password} = req.body
    if(!email || !login || !password) return res.sendStatus(401)

    const newUser: UserAccountDBType = await createUser(login, email, password)
    await UserModel.insertOne({...newUser})

    const viewUser = {
      id: newUser.id,
      login: newUser.AccountData.username,
      email: newUser.AccountData.email,
      createdAt: newUser.AccountData.createdAt
    }
    return res.status(201).send(viewUser)
  } catch (err){
    console.log(err, `=> post "/" usersRouter`)
    return null
  }
})

usersRouter.delete('/:id',checkAuth, async(req: Request, res: Response) => {
  try {
    const id = req.params.id
    const result = await UserModel.deleteOne({id})
    console.log(result)
    if(result.deletedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
  } catch (err){
    console.log(err, `=> delete "/:id" usersRouter`)
    return null
  }
})

