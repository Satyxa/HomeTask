import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
export const loginRouter = Router({});

loginRouter.post('/login', async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)

    const filter = {$or: [{email: loginOrEmail}, {login: loginOrEmail}]}
    const findUser = await patreonUsers.find(filter).toArray()


    if(!findUser || findUser.length === 0) return res.sendStatus(401)
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