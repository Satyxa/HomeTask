import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getResultByToken, getUserIdByToken} from "../autentification";
import jwt from "jsonwebtoken";
import * as uuid from 'uuid'
export const loginRouter = Router({});
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
loginRouter.get('/me', async (req: Request, res: Response) => {
    const headAuth = req.headers.authorization
    if(!headAuth)return res.sendStatus(401)
    const token = headAuth!.split(' ')[1]
    const userId = getUserIdByToken(token)
    if(!userId) return res.sendStatus(401)
    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) return res.sendStatus(404)
    else {
        const {email, username} = foundUser.AccountData
        req.userId = foundUser.id
        return res.status(200).send({email, login: username, userId})
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
        let deviceName = req.headers["user-agent"]
        let ip = req.ip
        const deviceId = uuid.v4()
        const token = await createToken(foundUser.id, deviceId, ip,'10s')
        const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20s')
        const {iat} = jwt.verify(token, secretKey)
        await patreonUsers.updateOne(filter, {$push: {sessions: {
                    ip,
                    title: deviceName,
                    deviceId,
                    lastActiveDate: iat.toISOString()
                }}})
        res.cookie('refreshToken', RefreshToken, {httpOnly: true,secure: true})
        return res.status(200).send({accessToken: token})
    } else return res.sendStatus(401)

})

loginRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const {refreshToken} = req.cookies
    const resultToken: any = getResultByToken(refreshToken)
    if(!resultToken || !resultToken.exp || new Date(resultToken.exp * 1000) < new Date()){
        console.log('expired')
        return res.sendStatus(401)
    }
    const user = await patreonUsers.findOne({'id': resultToken.userId})
    if (!user)return res.sendStatus(401)
    if(user!.tokenBlackList.includes(refreshToken))return res.sendStatus(401)
    const result = await patreonUsers.updateOne({'id': resultToken.userId}, {$push: {
            tokenBlackList: refreshToken
        }})
    if(result.matchedCount === 0)return res.sendStatus(401)
    let deviceName = req.headers["user-agent"]
    let ip = req.ip
    const deviceId = uuid.v4()
    const AccessToken = await createToken(resultToken.id, deviceId, ip,'10s')
    const newRefreshToken = await createToken(resultToken.id, deviceId, ip,'20s')
    const {iat} = jwt.verify(AccessToken, secretKey)
    await patreonUsers.updateOne({'id': resultToken.userId}, {$push: {sessions: {
                ip,
                title: deviceName,
                deviceId,
                lastActiveDate: iat.toISOString()
            }}})
    await patreonUsers.updateOne({'id': resultToken.userId}, {$push: {sessions: deviceName}})
    res.cookie('refreshToken', newRefreshToken, {httpOnly: true,secure: true})
    return res.status(200).send({accessToken: AccessToken})
})

loginRouter.post('/logout', async (req:Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies
        if (!refreshToken) return res.sendStatus(401)
        const userId = getResultByToken(refreshToken)
        if(!userId)return res.sendStatus(401)
        const user = await patreonUsers.findOne({'id':userId})
        if(user?.tokenBlackList.includes(refreshToken)) return res.sendStatus(401)
        const result = await patreonUsers.updateOne({'id': userId}, {$push: {
                tokenBlackList: refreshToken
            }})
        if(result.matchedCount === 0)return res.sendStatus(401)
        else return res.sendStatus(204)
    } catch (err){
        console.log(err)
        return res.sendStatus(401)
    }
})