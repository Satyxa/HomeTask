import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getUserIdByToken} from "../autentification";

export const loginRouter = Router({});

loginRouter.get('/me', async (req: Request, res: Response) => {
    if(!req.headers.authorization)return res.sendStatus(401)

    const token = req.headers.authorization.split(' ')[1]
    const userId = getUserIdByToken(token)

    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) return res.sendStatus(404)
    else {
        const {email, login} = foundUser
        return res.status(200).send({email, login, userId})
    }
})

loginRouter.post('/login', async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)

    const filter = {$or: [{email: loginOrEmail}, {login: loginOrEmail}]}
    const foundUser = await patreonUsers.findOne(filter)
    if(!foundUser) return res.sendStatus(401)

    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash)
    if(isValidPassword) {
        const token = await createToken(foundUser.id)
        return res.status(200).send({accessToken: token})
    } else return res.sendStatus(401)

})