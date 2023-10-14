import mongoose from "mongoose";
import {WithId} from "mongodb";
import {UserAccountDBType} from "../types";

export const UserSchema = new mongoose.Schema<WithId<UserAccountDBType>>({
    id: String,
    AccountData: {
        username: String,
        email: String,
        passwordHash: String,
        createdAt: Date
    },
    EmailConfirmation: {
        confirmationCode: String,
        expirationDate: Date,
        isConfirmed: Boolean
    },
    sessions: {
        ip: String,
        title: String,
        deviceId: String,
        lastActiveDate: Date,
    },
    recoveryCode: String
})

export const UserModel = mongoose.model<WithId<UserAccountDBType>>('users', UserSchema)