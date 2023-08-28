import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {checkValidation, loginValidation} from "../validation";
import {Result, ValidationError, validationResult} from "express-validator";
import {errorField} from "../types";
export const loginRouter = Router({});

loginRouter.post('/login',loginValidation, async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)

    const resultValidation: Result<ValidationError> = await validationResult(req)
    if(!resultValidation.isEmpty()){
        const errors = resultValidation.array()
        const errorsFields: errorField[] = []
        if(errors.length > 0){
            errors.map((err: any) => {
                errorsFields.push({message: err.msg, field: err.path})
            })
            return res.status(400).send({errorMessages: errorsFields})
        }}

    const filter = {$or: [{email: loginOrEmail}, {login: loginOrEmail}]}
    const findUser = await patreonUsers.find(filter).toArray()


    if(!findUser || findUser.length === 0) return res.sendStatus(404)
    const isValidPassword = await bcrypt.compare(password, findUser[0].passwordHash)

    if(isValidPassword) return res.sendStatus(204)
    else {
        return res.sendStatus(401).send({
            errorsMessages: [
                {
                    message: 'Auth invalid',
                    field: 'Auth'
                }
            ]
        })
    }
})