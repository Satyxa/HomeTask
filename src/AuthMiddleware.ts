import {NextFunction, Request, Response} from "express";
import {getUserIdByToken} from "./autentification";

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) return res.sendStatus(401)

    const token = req.headers.authorization.split(' ')[1]
    const userId = getUserIdByToken(token)
    if (!userId) return res.sendStatus(403)
    req.userId = userId
    next()
}