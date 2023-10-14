import {Router, Request, Response} from "express";
import {checkValidation, registerValidation} from "../validation";
import {UserAccountDBType, userT} from "../types";
import {createUser} from "../authentication";
import {UserModel} from "../db/UserModel";
import {emailAdapter} from "../email-adapter";
import {rateLimiter} from "../rateLimit";

export const registrationRouter = Router({})

registrationRouter.post('/registration', rateLimiter, ...registerValidation, checkValidation,  async(req: Request, res: Response) => {
    try {
        const {email, login, password} = req.body
        if(!email || !login || !password) return res.sendStatus(401)
        const newUser: UserAccountDBType = await createUser(login, email, password)
        await UserModel.create({...newUser})
        const result = await emailAdapter.sendEmail(newUser.AccountData.email, 'Confirm your email', `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${newUser.EmailConfirmation.confirmationCode}'>complete registration</a>
    </p>`)

        if(result === 1) return res.sendStatus(204)
    } catch (err){
        console.log(err, `=> post "/registration" registrationRouter`)
        return res.sendStatus(401)
    }
})