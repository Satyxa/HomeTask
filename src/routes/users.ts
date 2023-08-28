import {Request, Response, Router} from "express";
import {patreonUsers} from "../db/db";
import {errorField, userT} from "../types";
import {createUser} from "../autentification";
import {Filter} from "mongodb";
import {paginationSort} from "../PaginationAndSort";
import {checkAuth, checkValidation, loginValidation, usersValidation} from "../validation";
import {Result, ValidationError, validationResult} from "express-validator";

export const usersRouter = Router({});


usersRouter.get('/', checkAuth,async (req: Request, res: Response) => {
  const {pageNumber, pageSize, sortBy, searchLoginTerm, searchEmailTerm} = await paginationSort(req)
  const filter: Filter<userT> = {$or: [{login: {$regex: searchLoginTerm ?? '', $options: 'i'}}, {email: {$regex: searchEmailTerm ?? '', $options: 'i'}}]}
  const totalCount = await patreonUsers.countDocuments(filter)
  const pagesCount = Math.ceil(totalCount / pageSize)
  let sortDirection: "desc" | "asc" = "desc"
  if(req.query.sortDirection){
    if(req.query.sortDirection === 'asc'){
      sortDirection = 'asc'
    }
  }

  const users = await patreonUsers
      .find(filter, { projection : { _id:0, passwordHash: 0, passwordSalt: 0 }})
      .sort({[sortBy]: sortDirection})
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize)
      .toArray()
  return res.status(200).send({
    pagesCount,
    page: pageNumber,
    pageSize,
    totalCount,
    items: users})
})

usersRouter.post('/', usersValidation, checkAuth, async(req: Request, res: Response) => {

  const resultValidation: Result<ValidationError> = validationResult(req)
  if(!resultValidation.isEmpty()){
    const errors = resultValidation.array()
    const errorsFields: errorField[] = []
    console.log(errors)
    errors.map((err: any) => {
      errorsFields.push({message: err.msg, field: err.path})
      console.log(errorsFields)
    })

    if(errorsFields.length > 3){
      errorsFields.splice(3)
    }
    return res.status(400).send({errorsMessages: errorsFields})

  }
  console.log('after map')
  const {email, login, password} = req.body
  if(!email || !login || !password){
    return res.sendStatus(401)
  }
  console.log('after req body check')
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

