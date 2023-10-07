import {Router, Request, Response} from "express";
import {emailAdapter} from "../email-adapter";
import {patreonUsers} from "../db/db";
import {registrationRouter} from "./registration";
import * as uuid from 'uuid'
import {UserAccountDBType} from "../types";
import {ModifyResult} from "mongodb";
import {checkValidation, emailResending, isEmailCorrect, isNewPasswordCorrect} from "../validation";
import {rateLimiter} from "../rateLimit";
import {UserModel} from "../db/UserModel";
import bcrypt from "bcrypt";
import {generatedHash} from "../authentication";
export const emailRouter = Router({})

emailRouter.post('/registration-confirmation',rateLimiter, async (req: Request, res: Response) => {
    try {
        const code = req.body.code
        if(!code) return res.sendStatus(400)
        const checkConfirmationStatus = await patreonUsers.findOne({"EmailConfirmation.confirmationCode": code})
        if(!checkConfirmationStatus) return res.status(400).send({ errorsMessages: [{ message: 'invalid code', field: "code" }] })
        if (checkConfirmationStatus.EmailConfirmation.isConfirmed) return res.status(400).send({ errorsMessages: [{ message: 'already confirmed', field: "code" }] })

        const result = await patreonUsers.updateOne({"EmailConfirmation.confirmationCode": code}, {
            $set: {"EmailConfirmation.isConfirmed": true}})
        if (result.matchedCount === 1) return res.sendStatus(204)
    } catch (err){
        console.log(err, `=> post "/registration-confirmation"`)
        return null
    }
})

emailRouter.post('/', async (req: Request, res: Response) => {
    try {
        const {email, subject, message} = req.body
        await emailAdapter.sendEmail(email, subject, message, res)
    } catch (err) {
        console.log(err, `=> post "/" emailRouter`)
        return null
    }
})

registrationRouter.post('/registration-email-resending',rateLimiter, ...emailResending, checkValidation, async (req: Request, res: Response) => {
    try {
        const email: string = req.body.email
        if (!email) return res.sendStatus(400)
        const user = await patreonUsers.findOne({'AccountData.email': email})
        if(!user) return res.sendStatus(400)
        else if(user.EmailConfirmation.isConfirmed) return res.sendStatus(400)

        const userWithUpdatedCode: ModifyResult<UserAccountDBType> = await patreonUsers.findOneAndUpdate(
            {'AccountData.email': email},
            {$set: {'EmailConfirmation.confirmationCode': uuid.v4()}}, {returnDocument: 'after'})

        const newCode = userWithUpdatedCode.value!.EmailConfirmation.confirmationCode
        const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${newCode}>complete registration</a>
    </p>`
        await emailAdapter.sendEmail(email, 'email confirmation', message, res)
    } catch (err) {
        console.log(err, `=> post "/registration-email-resending" emailRouter`)
        return null
    }
})

emailRouter.post('/password-recovery', rateLimiter, ...isEmailCorrect, checkValidation, async (req:Request, res: Response) => {
    try {
        const {email} = req.body
        const user = await patreonUsers.findOne({'AccountData.email': email})
        if(!user) return res.sendStatus(204)
        else {
            const recoveryCode = uuid.v4()
            user.recoveryCode = recoveryCode
            const subject = 'Password Recovery'
            const message = `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`
            await emailAdapter.sendEmail(email, subject, message, res)
        }
    } catch (err) {
        console.log(err, `=> post "/password-recovery" emailRouter`)
        return null
    }
})

emailRouter.post('/new-password', rateLimiter, ...isNewPasswordCorrect, checkValidation, async (req:Request, res: Response) => {
    try {
    const {newPassword, recoveryCode} = req.body
        if(!recoveryCode) return res.sendStatus(400)
        const passwordSalt = await bcrypt.genSalt(10)
        const newPasswordHash = generatedHash(newPassword, passwordSalt)
        const result = await patreonUsers.updateOne({recoveryCode}, {recoveryCode: null, 'AccountData.passwordHash': newPasswordHash})
        if(result.matchedCount === 1) return res.sendStatus(204)
        else return res.sendStatus(400)
    } catch (err) {
        console.log(err, `=> post "/new-password" emailRouter`)
        return null
    }
})

