import {NextFunction, Request, Response} from "express";
import {getResultByToken} from "./authentication";
import {UserModel} from "./db/UserModel";
export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.sendStatus(401)
        if(!getResultByToken(refreshToken)) return res.sendStatus(401)

        const {userId, deviceId, iat} = getResultByToken(refreshToken)
        const foundUser = await UserModel.findOne({id:userId})
        if(!foundUser) return res.sendStatus(401)

        const existDevice = foundUser.sessions.some(device => device.deviceId === deviceId)
        const correctActiveDate = foundUser.sessions.some(date => date.lastActiveDate === iat.toString())
        if(existDevice || correctActiveDate){
            req.userId = foundUser.id
            next()
        } else if (!existDevice || !correctActiveDate) return res.sendStatus(403)
        else return res.sendStatus(401)
    } catch (err) {
        console.log(err, `=> AuthMiddleware`)
        return null
    }
}