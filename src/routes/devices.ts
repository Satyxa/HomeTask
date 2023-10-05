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
    try {
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
        console.log(9999999999)
        const result = await patreonUsers.updateOne({id: req.userId},{$pull: {sessions: {deviceId: {$ne: deviceId}}}})
        console.log(4444444444444444444)
        if(result.matchedCount >= 1) res.sendStatus(204)
        else return res.sendStatus(400)
    } catch (err){
        console.log(err, `=> delete all except current`)
        return res.sendStatus(500)
    }
})

devicesRouter.delete('/:deviceId', AuthMiddleware,async (req:Request, res:Response) => {
    const deviceIdParams = req.params.deviceId
    const user = await patreonUsers.findOne({'sessions.deviceId': deviceIdParams})
    if(!user) return res.sendStatus(404)
    if(req.userId !== user.id) return res.sendStatus(403)
    const result = await patreonUsers.updateOne({id: req.userId!},
        {$pull: {sessions: {deviceId: deviceIdParams}}})
    if(result.matchedCount === 1) return res.sendStatus(204)
    else return res.sendStatus(404)
})