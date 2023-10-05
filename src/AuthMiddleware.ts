import {NextFunction, Request, Response} from "express";
import {getUserIdByToken} from "./autentification";
import jwt from "jsonwebtoken";
import {patreonUsers} from "./db/db";
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    console.log(1)
    if (!refreshToken) return res.sendStatus(401)
    const testFunc = (refreshToken) => {
        try {
            const result =  jwt.verify(refreshToken, secretKey)
            return result
        } catch (err){
            return null
        }
    }
    if(!testFunc(refreshToken)) return res.sendStatus(401)
    const {userId ,deviceId, iat} = testFunc(refreshToken)
    console.log(userId)
    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) return res.sendStatus(401)
    const existDevice = foundUser.sessions.some(device => device.deviceId === deviceId)
    const correctActiveDate = foundUser.sessions.some(date => date.lastActiveDate === iat.toString())
    if(existDevice || correctActiveDate){
        req.userId = foundUser.id
        next()
    } else return res.sendStatus(401)
}