import {userT} from "./types";
import bcrypt from 'bcrypt'
import * as uuid from 'uuid'

const generatedHash = async(password: string, salt: string) => {
    return await bcrypt.hash(password, salt)

}

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