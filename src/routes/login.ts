import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {loginValidation} from "../validation";
import {validationResult,Result, ValidationError, ResultFactory} from "express-validator";
export const loginRouter = Router({});

loginRouter.post('/login', loginValidation, async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    // if(!loginOrEmail || !password )return res.sendStatus(400)
    //
    const resultValidation: Result<ValidationError> = validationResult(req)
    if(!resultValidation.isEmpty()){
        const errors = resultValidation.array()
        const errorsFields = []
        errors.map((err: any) => {
            errorsFields.push({message: err.msg, field: err.path})
        })
        return res.status(400).send({errorMessages: errorsFields})
    }
    const filter = {$or: [{email: loginOrEmail}, {username: loginOrEmail}]}
    const findUser = await patreonUsers.find(filter).toArray()


    if(!findUser || findUser.length === 0) return res.sendStatus(404)
    const isValidPassword = await bcrypt.compare(password, findUser[0].passwordHash)
    if(isValidPassword) {return res.status(201).send(findUser)}
    else {
        res.sendStatus(401).send({
            errorsMessages: [
                {
                    message: 'Auth invalid',
                    field: 'Auth'
                }
            ]
        })
    }
})