import {Router, Response, Request} from "express";
import {AuthMiddleware} from "../AuthMiddleware";
import {UserModel} from "../db/UserModel";
import jwt from "jsonwebtoken";
import {getResultByToken} from "../authentication";

export const devicesRouter = Router({})
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
devicesRouter.get('/', AuthMiddleware, async (req: Request, res: Response) => {
    try {
        const foundUser = await UserModel.findOne({id: req.userId})
        const foundUserDevices = foundUser!.sessions
        return res.status(200).send(foundUserDevices)
    } catch (err){
        console.log(err, `=> get "/" deviceRouter`)
        return null
    }
})

devicesRouter.delete('/', AuthMiddleware, async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(!getResultByToken(refreshToken)) return res.sendStatus(401)
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) return res.sendStatus(401)
        const {deviceId} = tokenPayload
        const result = await UserModel.updateOne({id: req.userId},{$pull: {sessions: {deviceId: {$ne: deviceId}}}})
        if(result.matchedCount >= 1) return res.sendStatus(204)
        else return res.sendStatus(400)
    } catch (err){
        console.log(err, `=> delete all "/" deviceRouter`)
        return res.sendStatus(500)
    }
})

devicesRouter.delete('/:deviceId', AuthMiddleware,async (req:Request, res:Response) => {
    try {
        const deviceIdParams = req.params.deviceId
        const user = await UserModel.findOne({'sessions.deviceId': deviceIdParams})
        if(!user) return res.sendStatus(404)
        if(req.userId !== user.id) return res.sendStatus(403)
        const result = await UserModel.updateOne({id: req.userId!},
            {$pull: {sessions: {deviceId: deviceIdParams}}})
        if(result.matchedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(404)
    } catch (err){
        console.log(err, `=> delete "/:deviceId" deviceRouter`)
        return null
    }
})