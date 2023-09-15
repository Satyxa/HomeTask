import {Router, Response, Request} from "express";
import {AuthMiddleware} from "../AuthMiddleware";
import {patreonUsers} from "../db/db";
import jwt from "jsonwebtoken";

export const devicesRouter = Router({})
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
devicesRouter.get('/', AuthMiddleware, async (req: Request, res: Response) => {
    const foundUser = await patreonUsers.findOne({id: req.userId})
    const foundUserDevices = foundUser!.sessions
    return res.status(200).send(foundUserDevices)
})

devicesRouter.delete('/', AuthMiddleware, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const testFunc = (refreshToken) => {
        try {
            const result =  jwt.verify(refreshToken, secretKey)
            return result
        } catch (err){
            return null
        }
    }
    const {deviceId} = testFunc(refreshToken)
    const result = await patreonUsers.updateOne({id: req.userId},{sessions: {$ne: {'AccountData.sessions.deviceId': deviceId}}})
    if(result.matchedCount >= 1) res.sendStatus(204)
    else return res.sendStatus(400)
})

devicesRouter.delete('/:deviceId', async (req:Request, res:Response) => {
    const deviceIdParams = req.params.deviceId
    const result = await patreonUsers.deleteOne({'sessions.deviceId': deviceIdParams})
    if(result.deletedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
})