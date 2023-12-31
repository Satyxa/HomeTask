import {NextFunction, Request, Response} from "express";
import {errorField} from "./types";
import {UserModel} from "./db/UserModel";
import {BlogModel} from "./db/BlogModel"
import {body, Result, ValidationError, validationResult} from "express-validator";
import exp from "constants";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const headersData = req.headers.authorization
    if (headersData) {

        if(headersData === 'Basic admin:qwerty')return res.sendStatus(401)

        const data = atob((headersData).replace('Basic ', ''))
        const login = data.split(':')[0]
        const password = data.split(':')[1]

        if (login === 'admin' && password === 'qwerty') next()
        else return res.sendStatus(401)

    } else return res.sendStatus(401)

}

export const createVideoValidation = [
    body('title', 'title invalid').exists().trim().isLength({max: 40, min: 1}),
    body('author', 'author invalid').exists().trim().isLength({max: 20, min: 1}),
    body('availableResolutions', 'availableResolutions invalid').exists().isArray().custom(async val => {
        const AvRes = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160']
        val.map((resolution: string) => {
            if(!AvRes.includes(resolution)){
                throw new Error('not existing resolution')
            } else return true
        })
    }),
]

export const updateVideoValidation = [
    body('canBeDownloaded', 'canBeDownloaded Invalid').exists().isBoolean(),
    body('minAgeRestriction', 'minAgeRestriction Invalid').exists().isNumeric().isFloat({min: 1, max: 18}),
    body('publicationDate', 'publicationDate Invalid').exists().isString().trim(),
]

export const postCreateValidation = [
    body('title', 'title Invalid').exists().trim().isLength({max: 30, min: 1}),
    body('shortDescription', 'shortDescription Invalid').exists().trim().isLength({max: 100, min: 1}),
    body('content', 'content Invalid').exists().trim().isLength({max: 1000, min: 1}),
]

export const blogIdValidation = [
    body('blogId', 'blogId Invalid').exists().isString().custom(async val => {
        const result = await BlogModel.findOne({id: val})
        if (!result) throw new Error('not existing blogId')
        else return true
    })
]

export const blogsCreateValidation = [
    body('name', 'name invalid').exists().isString().trim().isLength({max: 15, min: 1}),
    body('description', 'description invalid').exists().trim().isLength({max: 500, min: 1}),
    body('websiteUrl', 'websiteUrl invalid').exists().trim().isURL().isLength({max: 100, min: 1})
]

export const emailResending = [
    body('email', 'incorrect email').exists().isString().isLength({min: 6}).isEmail().custom(async (val) => {
        const result = await UserModel.findOne({'AccountData.email': val})
        if(!result)throw new Error('email not exist')
        const confirmedStatus = result!.EmailConfirmation.isConfirmed
        if(confirmedStatus) throw new Error('email already confirmed')
        else return true
    }),
]

export const registerValidation = [
    body('password', 'incorrect password').exists().isString().isLength({min: 6, max: 20}),
    body('email', 'incorrect email').exists().isString().isEmail().custom(async (val) => {
        const result = await UserModel.findOne({'AccountData.email': val})
        console.log(result)
        if(result){
            throw new Error('email already exist')
        } else return true
        }),
    body('login', 'incorrect login').exists().isString().isLength({min: 3, max: 10}).custom(async (val) => {
        const result = await UserModel.findOne({'AccountData.username': val})
        if(result){
            throw new Error('login already exist')
        } else return true
    })
]

export const usersValidation = [
    body('login', 'incorrect login').exists().isString().isLength({min: 3, max: 10}),
    body('password', 'incorrect password').exists().isString().isLength({min: 6, max: 20}),
    body('email', 'incorrect email').exists().isString().isEmail(),
]

export const commentValidator = [
    body('content', 'content failed').exists().isLength({min: 20, max: 300})
]

export const isEmailCorrect = [
    body('email', 'incorrect email').exists().isString().isEmail()
]

export const isNewPasswordCorrect = [
    body('newPassword', 'incorrect password').exists().isString().isLength({min: 6, max: 20})
]

export const isRecoveryCodeCorrect = [
    body('recoveryCode', 'incorrect recoveryCode').exists().isString().custom(async (val) => {
    const result = await UserModel.findOne({recoveryCode: val})
        if(result){
            throw new Error('login already exist')
        } else return true
})
]

export const isLikeStatusCorrect = [
    body('likeStatus', 'incorrect likeStatus').exists().isString()
        .isIn(['Like', 'Dislike', 'None'])
]

export const newPassValidation = [
    body('newPassword', 'incorrect password').exists().isString().isLength({min: 6, max: 20}),
    body('recoveryCode', 'incorrect recoveryCode').exists().isString().custom(async (val) => {
        const result = await UserModel.findOne({recoveryCode: val})
        if(!result){
            throw new Error('recovery code is incorrect')
        } else return true
    })
]

export const getResultValidation = (req: Request) => {
    const resultValidation: Result<ValidationError> = validationResult(req)
    if(!resultValidation.isEmpty()){
        const errors = resultValidation.array({ onlyFirstError: true })
        const errorsFields: errorField[] = []

        errors.map((err: any) => {
            errorsFields.push({message: err.msg, field: err.path})

        })
        return errorsFields


    } else {
        return 1
    }

}

export const checkValidation = (req: Request, res: Response, next: NextFunction) => {
    const resultValidation = getResultValidation(req)
    if (resultValidation !== 1) return res.status(400).send({errorsMessages: resultValidation})
    else next()
}