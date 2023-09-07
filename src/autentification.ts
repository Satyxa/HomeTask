import {UserAccountDBType, userT} from "./types";
import bcrypt from 'bcrypt'
import * as uuid from 'uuid'
import jwt from 'jsonwebtoken'
import add from 'date-fns/add'
import {patreonUsers} from "./db/db";
import {Filter} from "mongodb";
const secretKey = 'satyxaKeygghtthslkdfk!trerm'

const generatedHash = async (password: string, salt: string) => await bcrypt.hash(password, salt)


export const createUser = async (login: string, email: string, password: string): Promise<UserAccountDBType> => {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await generatedHash(password, passwordSalt)
    return {
        id: uuid.v4(),
        AccountData: {
            username: login,
            email,
            passwordHash,
            createdAt: new Date().toISOString()
        },
        EmailConfirmation: {
            confirmationCode: uuid.v4(),
            expirationDate: add(new Date(), {hours: 1, minutes: 3}).toISOString(),
            isConfirmed: false
        }
    }
}



export const createToken = async (id: string, exp) => {
    return jwt.sign({userId: id}, secretKey, {expiresIn: exp})
}

export const getUserIdByToken = (token: string) => {
    try {
        const result:any = jwt.verify(token, secretKey)
        return result.userId
    } catch (err){
        console.log(err)
        return null
    }
}