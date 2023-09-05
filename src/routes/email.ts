
import {Router, Request, Response} from "express";
import {emailAdapter} from "../email-adapter";
import {patreonUsers} from "../db/db";
import {registrationRouter} from "./registration";
import * as uuid from 'uuid'
import {UserAccountDBType} from "../types";
import {ModifyResult, UpdateResult} from "mongodb";
import {checkValidation, emailResending} from "../validation";
export const emailRouter = Router({})

emailRouter.post('/registration-confirmation', async (req: Request, res: Response) => {
    try {
        const code = req.body.code
        if(!code) return res.sendStatus(400)
        const checkConfirmationStatus = await patreonUsers.findOne({"EmailConfirmation.confirmationCode": code})
        if(checkConfirmationStatus!.EmailConfirmation.isConfirmed) {
            return res.status(400).send({errorsMessages: [{message: 'code invalid', field: "code"}]})
        }
        const userCheck = await patreonUsers.findOne({"EmailConfirmation.confirmationCode": code})
        if(userCheck?.EmailConfirmation.confirmationCode !== code) {
            console.log(code, userCheck?.EmailConfirmation.confirmationCode)
            return res.status(400).send({ errorsMessages: [{ message: 'invalid code 4', field: "code" }] })
        }
        console.log(userCheck)
        if(!userCheck) return res.status(400).send({ errorsMessages: [{ message: 'invalid code 3', field: "code" }] })
        const result = await patreonUsers.updateOne({"EmailConfirmation.confirmationCode": code}, {
            $set: {"EmailConfirmation.isConfirmed": true}})
        if (result.matchedCount === 1) return res.sendStatus(204)
        else return res.status(400).send({ errorsMessages: [{ message: 'invalid code 2', field: "code" }] })

    } catch (err){
        console.log(err)
        return null
    }
})

emailRouter.post('/', async (req: Request, res: Response) => {
    const {email, subject, message} = req.body
    await emailAdapter.sendEmail(email, subject, message, res)
})

registrationRouter.post('/registration-email-resending', ...emailResending, checkValidation, async (req: Request, res: Response) => {
    const email: string = req.body.email
    if (!email) return res.sendStatus(400)
    const user = await patreonUsers.findOne({'AccountData.email': email})
    const userWithUpdatedCode: ModifyResult<UserAccountDBType> = await patreonUsers.findOneAndUpdate(
        {'AccountData.email': email},
        {$set: {'EmailConfirmation.confirmationCode': uuid.v4()}},
    {returnDocument: 'after'}
    )
    const newCode = userWithUpdatedCode.value!.EmailConfirmation.confirmationCode
    if(!user) return res.sendStatus(400)
    else if(user.EmailConfirmation.isConfirmed) return res.sendStatus(400)
    const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${newCode}>complete registration</a>
    </p>`
    await emailAdapter.sendEmail(email, 'email confirmation', message, res)
})