import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getUserIdByToken} from "../autentification";
import jwt from "jsonwebtoken";
import {log} from "util";
export const loginRouter = Router({});
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
loginRouter.get('/me', async (req: Request, res: Response) => {
    const headAuth = req.headers.authorization
    if(!req.headers.authorization)return res.sendStatus(401)
    const token = req.headers.authorization!.split(' ')[1]
    const userId = getUserIdByToken(token)
    console.log(token)
    console.log(4)
    if(!userId) return res.sendStatus(401)
    console.log(5)
    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) return res.sendStatus(404)

    else {
        const {email, login} = foundUser.AccountData
        console.log(foundUser)
        req.userId = foundUser.id
        return res.status(200).send({email, login, userId})
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
        const token = await createToken(foundUser.id, '20s')
        const RefreshToken = await createToken(foundUser.id, '30s')
        res.cookie('refreshToken', RefreshToken, {httpOnly: true,secure: true})
        return res.status(200).send({accessToken: token})
    } else return res.sendStatus(401)

})

loginRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const {refreshToken} = req.cookies
    const testFunc = (refreshToken) => {
        try {
            const result: any = jwt.verify(refreshToken, secretKey)
            return result
        } catch (err){
            return null
        }
    }
    const resultToken: any = testFunc(refreshToken)

    if(!resultToken.exp || resultToken.exp * 1000 < new Date()){
        console.log('expired')
        return res.sendStatus(401)
    }
    const user = await patreonUsers.findOne({'AccountData.userId': resultToken.userId})
    if (!user)return res.sendStatus(401)
    if(user!.tokenBlackList.includes(refreshToken))return res.sendStatus(401)
    const result = await patreonUsers.updateOne({'AccountData.userId': resultToken.userId}, {$push: {
            tokenBlackList: refreshToken
        }})
    if(result.matchedCount === 0)return res.sendStatus(401)


    const AccessToken = await createToken(req.userId!, '20s')
    const newRefreshToken = await createToken(req.userId!, '30s')
    res.cookie('refreshToken', newRefreshToken, {httpOnly: true,secure: true})
    return res.status(200).send({accessToken: AccessToken})
})

loginRouter.post('/logout', async (req:Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies
        console.log(1)
        console.log(req.cookies)
        if (!refreshToken) return res.sendStatus(401)
        console.log(2)
        const testFunc = (refreshToken) => {
            try {
                const result: any = jwt.verify(refreshToken, secretKey)
                return result.userId
            } catch (err){
                return null
            }
        }
        const userId = testFunc(refreshToken)
        console.log(3)
        if(!userId)return res.sendStatus(401)
        console.log(4)
        const user = await patreonUsers.findOne({'AccountData.userId':userId})
        console.log(5)
        if(user?.tokenBlackList.includes(refreshToken)) return res.sendStatus(401)
        const result = await patreonUsers.updateOne({'AccountData.userId': userId}, {$push: {
                tokenBlackList: refreshToken
            }})
        console.log(6)
        if(result.matchedCount === 0)return res.sendStatus(401)
        else return res.sendStatus(204)
    } catch (err){
        console.log(err)
        return res.sendStatus(401)
    }
})