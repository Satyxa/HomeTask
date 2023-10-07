import {Router, Request, Response} from "express";
import {UserModel} from "../db/UserModel";
import bcrypt from "bcrypt";
import {createToken, getResultByToken, getUserIdByToken} from "../authentication";
import jwt from "jsonwebtoken";
import * as uuid from 'uuid'
import {rateLimiter} from "../rateLimit";
export const loginRouter = Router({});
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
loginRouter.get('/me', async (req: Request, res: Response) => {
    try {
        const headAuth = req.headers.authorization
        if(!headAuth)return res.sendStatus(401)

        const token = headAuth!.split(' ')[1]
        const userId = getUserIdByToken(token)
        if(!userId) return res.sendStatus(401)

        const foundUser = await UserModel.findOne({id:userId})
        if(!foundUser) return res.sendStatus(404)
        else {
            const {email, username} = foundUser.AccountData
            req.userId = foundUser.id
            return res.status(200).send({email, login: username, userId})
        }
    } catch (err) {
        console.log(err, `=> get Me "/me" loginRouter`)
        return null
    }
})


loginRouter.post('/login', rateLimiter, async (req: Request, res: Response) => {
    try {
        const {loginOrEmail, password} = req.body
        if(!loginOrEmail || !password )return res.sendStatus(400)
        const filter = {$or: [{'AccountData.email': loginOrEmail}, {'AccountData.username': loginOrEmail}]}
        const foundUser = await UserModel.findOne(filter)
        if(!foundUser) return res.sendStatus(401)

        const isValidPassword = await bcrypt.compare(password, foundUser.AccountData.passwordHash)
        if(isValidPassword) {

            let deviceName = req.headers["user-agent"]
            let ip = req.ip
            const deviceId = uuid.v4()

            const token = await createToken(foundUser.id, deviceId, ip,'10s')
            const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20s')
            const {iat} = jwt.verify(token, secretKey)

            const newDevice = {
                ip,
                title: deviceName,
                deviceId,
                lastActiveDate: new Date(iat * 1000).toISOString()
            }

            await UserModel.updateOne(filter, {$push: {sessions: newDevice}})
            res.cookie('refreshToken', RefreshToken, {httpOnly: true,secure: true})
            return res.status(200).send({accessToken: token})
        } else return res.sendStatus(401)
    } catch (err) {
        console.log(err, `=> post "/login" loginRouter`)
        return null
    }
})

loginRouter.post('/refresh-token', async (req: Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies
        if(!getResultByToken(refreshToken)) return res.sendStatus(401)
        const resultToken: any = getResultByToken(refreshToken)
        if(new Date(resultToken.exp * 1000) < new Date()) return res.sendStatus(401)

        const user = await UserModel.findOne({'id': resultToken.userId})
        if (!user)return res.sendStatus(401)

        const AccessToken = await createToken(resultToken.userId, resultToken.deviceId, resultToken.ip,'10s')
        const newRefreshToken = await createToken(resultToken.userId, resultToken.deviceId, resultToken.ip,'20s')

        const {iat}: number = jwt.verify(newRefreshToken, secretKey)
        const sessions = [...user.sessions]
        const sessionForUpdate = sessions.find(s => s.deviceId === resultToken.deviceId)
        sessionForUpdate.lastActiveDate =  new Date(iat * 1000).toISOString()
        await UserModel.updateOne({'id': resultToken.userId}, {$set: {sessions}})
        res.cookie('refreshToken', newRefreshToken, {httpOnly: true,secure: true})
        return res.status(200).send({accessToken: AccessToken})
    } catch (err) {
        console.log(err, `=> post "/refresh-token" loginRouter`)
        return null
    }
})

loginRouter.post('/logout', async (req:Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies
        if (!refreshToken) return res.sendStatus(401)
        if(!getResultByToken(refreshToken))  return res.sendStatus(401)

        const {userId, deviceId}: string = getResultByToken(refreshToken)
        if(!userId)return res.sendStatus(401)

        const result = await UserModel.updateOne({id: userId},
            {$pull: {sessions: {deviceId}}})

        if(result.matchedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(401)
    } catch (err){
        console.log(err, `=> post "/logout" loginRouter`)
        return res.sendStatus(401)
    }
})