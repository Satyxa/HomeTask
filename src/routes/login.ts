import {Router, Request, Response, NextFunction} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getUserIdByToken} from "../autentification";
import {AuthMiddleware} from "../AuthMiddleware";
export const loginRouter = Router({});

loginRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    if(!req.headers.authorization){
        return res.sendStatus(401)
    }
    const token = req.headers.authorization.split(' ')[1]
    const userId = getUserIdByToken(token)

    const foundUser = await patreonUsers.find({id:userId}).toArray()
    if(!foundUser || foundUser.length === 0) return res.sendStatus(404)
    else {
        const {email, login} = foundUser[0]
        return res.status(200).send({email, login, userId})
    }
})

loginRouter.post('/login', async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)
    const filter = {$or: [{email: loginOrEmail}, {login: loginOrEmail}]}
    const foundUser = await patreonUsers.find(filter).toArray()
    if(!foundUser || foundUser.length === 0) {
        return res.sendStatus(401)
    }
    const isValidPassword = await bcrypt.compare(password, foundUser[0].passwordHash)
    if(isValidPassword) {
        const token = await createToken(foundUser[0].id)
        //@ts-ignore
        req.userId = token
        return res.status(200).send(token)
    }
    else {
        return res.sendStatus(401)
    }
})