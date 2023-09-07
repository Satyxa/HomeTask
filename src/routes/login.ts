import {Router, Request, Response} from "express";
import {patreonIvalidTokens, patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getUserIdByToken} from "../autentification";
import * as uuid from 'uuid'
export const loginRouter = Router({});

loginRouter.get('/me', async (req: Request, res: Response) => {
    if(!req.headers.authorization)return res.sendStatus(401)

    const token = req.headers.authorization.split(' ')[1]
    const userId = getUserIdByToken(token)

    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) return res.sendStatus(404)
    else {
        const {email, login} = foundUser
        req.userId = foundUser.id
        return res.status(200).send({email, login, userId})
    }
})
loginRouter.post('/login', async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    if(!loginOrEmail || !password )return res.sendStatus(400)

    const filter = {$or: [{'AccountData.email': loginOrEmail}, {'AccountData.username': loginOrEmail}]}
    const foundUser = await patreonUsers.findOne(filter)
    if(!foundUser) return res.sendStatus(401)

    const isValidPassword = await bcrypt.compare(password, foundUser.AccountData.passwordHash)
    if(isValidPassword) {
        const token = await createToken(foundUser.id, '10s')
        const RefreshToken = await createToken(foundUser.id, '20s')
        res.cookie('RefreshToken', RefreshToken, {httpOnly: true,secure: true})
        return res.status(200).send({accessToken: token})
    } else return res.sendStatus(401)

})

loginRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const AccessToken = await createToken(req.userId!, '10s')
    const newRefreshToken = await createToken(req.userId!, '20s')
    res.cookie('RefreshToken', newRefreshToken, {httpOnly: true,secure: true})
    return res.status(200).send({AccessToken})
})