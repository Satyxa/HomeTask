import {NextFunction, Request, Response} from "express";
import {getUserIdByToken} from "./autentification";

export const AuthMiddleware = async (req: Request, res: Response, next:NextFunction) => {
    if(!req.headers.authorization) return res.sendStatus(401)

    const token = req.headers.authorization.split(' ')[1]
    req.userId = getUserIdByToken(token)
    next()
}