import {userT} from "./types";
import bcrypt from 'bcrypt'
import * as uuid from 'uuid'
import jwt from 'jsonwebtoken'

const secretKey = 'satyxaKeygghtthslkdfk!trerm'

const generatedHash = async (password: string, salt: string) => await bcrypt.hash(password, salt)


export const createUser = async (login: string, email: string, password: string): Promise<userT> => {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await generatedHash(password, passwordSalt)

    return {
        id: uuid.v4(),
        login,
        email,
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString()
    }
}

export const createToken = async (id: string) => {
    return jwt.sign({userId: id}, secretKey, {expiresIn: '1h'})
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