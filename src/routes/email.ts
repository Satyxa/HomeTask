
import {Router, Request, Response} from "express";
import {emailAdapter} from "../email-adapter";
import {patreonUsers} from "../db/db";
import {registrationRouter} from "./registration";

export const emailRouter = Router({})

emailRouter.post('/registration-confirmation', async (req: Request, res: Response) => {
    try {
        const code: string = req.body.code
        if(!code) return res.sendStatus(400)
        const result = await patreonUsers.updateOne({"EmailConfirmation.confirmationCode": code}, {$set: {
                "EmailConfirmation.isConfirmed": true
            }})
        if(result.matchedCount === 1) return res.status(204)
        else return res.sendStatus(404)


    } catch (err){
        console.log(err)
        return null
    }
})

emailRouter.post('/', async (req: Request, res: Response) => {
    const {email, subject, message} = req.body
    await emailAdapter.sendEmail(email, subject, message, res)
})

registrationRouter.post('/registration-email-resending', async (req: Request, res: Response) => {
    const email: string = req.body.email
    if (!email) return res.sendStatus(400)
    const user = await patreonUsers.findOne({'AccountData.email': email})
    if(!user) return res.sendStatus(404)
    else if(user.EmailConfirmation.isConfirmed) return res.sendStatus(400)
    await emailAdapter.sendEmail(email, 'email confirmation', user.EmailConfirmation.confirmationCode, res)
})