import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
export const loginRouter = Router({});

loginRouter.post('/', async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)

    let findUser;
    if(loginOrEmail.includes('@')){findUser = await patreonUsers.find({email: loginOrEmail}).toArray()}
    else { findUser = await patreonUsers.find({username: loginOrEmail}).toArray() }

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