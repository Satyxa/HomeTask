import {NextFunction, Request, Response} from "express";
import {getResultByToken} from "./authentication";
import {UserModel} from "./db/UserModel";
export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const refreshToken = req.cookies.refreshToken
        // console.log(refreshToken)
        // if (!refreshToken) return res.sendStatus(401)
        if(!req.headers.authorization) return res.sendStatus(401)
        const accessToken = req.headers.authorization.split(' ')[1]
        if(!accessToken) return res.sendStatus(401)
        if(!getResultByToken(accessToken)) return res.sendStatus(401)

        const tokenPayload = await getResultByToken(accessToken)
        if(!tokenPayload) return res.sendStatus(401)
        const {userId, deviceId, iat} = tokenPayload
        const foundUser = await UserModel.findOne({id:userId}).lean()
        if(!foundUser) return res.sendStatus(401)
        const existDevice = foundUser.sessions.some(device => device.deviceId === deviceId)
        const correctActiveDate = foundUser.sessions.some(date => date.lastActiveDate === iat.toString())
        if(existDevice || correctActiveDate){
            req.userId = foundUser.id
            next()
        }
        else return res.sendStatus(401)
    } catch (err) {
        console.log(err, `=> AuthMiddleware`)
        return null
    }
}