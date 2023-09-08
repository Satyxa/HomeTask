import {Router, Request, Response} from "express";
import {patreonUsers} from "../db/db";
import bcrypt from "bcrypt";
import {createToken, getUserIdByToken} from "../autentification";
import jwt from "jsonwebtoken";
export const loginRouter = Router({});
const secretKey = 'satyxaKeygghtthslkdfk!trerm'
loginRouter.get('/me', async (req: Request, res: Response) => {
    const headAuth = req.headers.authorization
    if(!req.headers.authorization)return res.sendStatus(401)
    const token = req.headers.authorization!.split(' ')[1]
    const userId = getUserIdByToken(token)
    if(!userId) return res.sendStatus(401)
    const foundUser = await patreonUsers.findOne({id:userId})
    if(!foundUser) {
        return res.sendStatus(404)
    }
    else {
        const {email, login} = foundUser
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
        const token = await createToken(foundUser.id, '10s')
        const RefreshToken = await createToken(foundUser.id, '20s')
        res.cookie('refreshToken', RefreshToken, {httpOnly: true,secure: true})
        return res.status(200).send({accessToken: token})
    } else return res.sendStatus(401)

})

loginRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const {refreshToken} = req.cookies
    // const {userId} = jwt.verify(refreshToken, secretKey)
    const user = await patreonUsers.findOne({'AccountData.userId': req.userId})
    if (!user)return res.sendStatus(401)
    if(user!.tokenBlackList.includes(refreshToken))return res.sendStatus(401)
    const result = await patreonUsers.updateOne({'AccountData.userId': req.userId}, {$push: {
            tokenBlackList: refreshToken
        }})
    if(result.matchedCount === 0)return res.sendStatus(401)


    const AccessToken = await createToken(req.userId!, '10s')
    const newRefreshToken = await createToken(req.userId!, '20s')
    res.cookie('refreshToken', newRefreshToken, {httpOnly: true,secure: true})
    return res.status(200).send({AccessToken})
})

loginRouter.post('/logout', async (req:Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies
        if (!refreshToken) return res.sendStatus(401)
        const {userId} = jwt.verify(refreshToken, secretKey)
        if(!userId)return res.sendStatus(401)
        const user = await patreonUsers.findOne({'AccountData.userId': req.userId})
        if(user?.tokenBlackList.includes(refreshToken)) return res.sendStatus(401)
        const result = await patreonUsers.updateOne({'AccountData.userId': req.userId}, {$push: {
                tokenBlackList: refreshToken
            }})
        if(result.matchedCount === 0)return res.sendStatus(401)
        else return res.sendStatus(204)
    } catch (err){
        console.log(err)
        return res.sendStatus(401)
    }
})