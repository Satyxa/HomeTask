
import {Router, Request, Response} from "express";
import {emailAdapter} from "../email-adapter";
import {patreonUsers} from "../db/db";
import {registrationRouter} from "./registration";
import * as uuid from 'uuid'
import {UserAccountDBType} from "../types";
import {ModifyResult, UpdateResult} from "mongodb";
export const emailRouter = Router({})

emailRouter.post('/registration-confirmation', async (req: Request, res: Response) => {
    try {
        const code = req.query.code || req.body.code
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
    const userWithUpdatedCode: ModifyResult<UserAccountDBType> = await patreonUsers.findOneAndUpdate(
        {'AccountData.email': email},
        {$set: {'EmailConfirmation.confirmationCode': uuid.v4()}},
    {returnDocument: 'after'}
    )
    const newCode = userWithUpdatedCode.value!.EmailConfirmation.confirmationCode
    if(!user) return res.sendStatus(404)
    else if(user.EmailConfirmation.isConfirmed) return res.sendStatus(400)
    const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href='https://home-task-f6h9.vercel.app/auth/registration-confirmation?code=${newCode}'>complete registration</a>
    </p>`
    await emailAdapter.sendEmail(email, 'email confirmation', message, res)
})