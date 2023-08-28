import {NextFunction, Request, Response} from "express";
import {errorField, ValidationErrorType} from "./types";
import {patreonBlogs} from "./db/db";
import {body, Result, ValidationError, validationResult} from "express-validator";

export const blogsCreateValidation = (req: Request, res: Response, next: NextFunction) => {
    const {name, description, websiteUrl} = req.body
    const errors:ValidationErrorType[] = []
    if(!name || !name.trim() || name.length > 15){
        errors.push({message: 'invalid name', field: 'name'})
    }
    if(!description || !description.trim() || description.length > 500){
        errors.push({message: 'invalid description', field: 'description'})
    }
    if(!websiteUrl || websiteUrl.length > 100 || !websiteUrl.includes('http', 0) ){
        errors.push({message: 'invalid websiteUrl', field: 'websiteUrl'})
    }
    if (errors.length){
        return res.status(400).send({
            errorsMessages: errors
        })
    } else {
        next()
    }
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {

        if(req.headers.authorization === 'Basic admin:qwerty'){
            return res.sendStatus(401)
        }
        const data = atob((req.headers.authorization).replace('Basic ', ''))
        const login = data.split(':')[0]
        const password = data.split(':')[1]
        if (login === 'admin' && password === 'qwerty') {
            next()
        } else {
            return res.sendStatus(401)
        }
    } else {
        return res.sendStatus(401)
    }

}

export const postCreateValidation = async (req: Request, res: Response, next: NextFunction) => {
    const {title, shortDescription, content, blogId} = req.body
    const errors: ValidationErrorType[] = []
    if (!title || !title.trim() || title.length > 30) {
        errors.push({message: 'invalid title', field: 'title'})
    }
    if (!shortDescription || !shortDescription.trim() || shortDescription.length > 100) {
        errors.push({message: 'invalid shortDescription', field: 'shortDescription'})
    }
    if (!content || !content.trim() || content.length > 1000) {
        errors.push({message: 'invalid content', field: 'content'})
    }
    if(blogId) {
        const result = await patreonBlogs.findOne({id: blogId})
        if(!result){
            errors.push({message: 'no such blog', field: 'blogId'})
        }
    }
    if(errors.length){
        return res.status(400).send({
            errorsMessages: errors
        })
    } else {
        next()
    }
}

export const createVideoValidation = (title: string, author: string,
                               availableResolutions: Array<string>) => {
    const AvRes = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160']
    const errors: ValidationErrorType[] = []
    if(!title || !title.trim() || title.length > 40 ) {
        errors.push({message: 'invalid title', field: 'title'})
    }
    if(!author || !author.trim() || author.length > 20)  {
        errors.push({message: 'invalid author', field: 'author'})
    }

    if(!availableResolutions) {
        errors.push({message: 'invalid availableResolutions', field: 'availableResolutions'})
    } else if(availableResolutions){
        availableResolutions.map(ar => {
            if(!AvRes.includes(ar)){
                errors.push({message: 'invalid avail222ableResolutions', field: 'availableResolutions'})
            }
        })
    }
    return errors
}

export const updateVideoValidation = (canBeDownloaded: boolean, minAgeRestriction: number,
                                      publicationDate: string) => {
    const errors: ValidationErrorType[] = []

    if(!canBeDownloaded){
        errors.push({message: 'invalid canBeDownloaded', field: 'canBeDownloaded'})
    }
    if(!minAgeRestriction || minAgeRestriction > 18 || minAgeRestriction < 1){
        errors.push({message: 'invalid minAgeRestriction', field: 'minAgeRestriction'})
    }
    if(!publicationDate){
        errors.push({message: 'invalid publicationDate', field: 'publicationDate'})
    }
    return errors
}

export const loginValidation = [
    body('password', 'incorrect password').isString().isLength({min: 6, max: 20}),
    body('email', 'incorrect email').optional().isString().isLength({min: 6, max: 20}).isEmail(),
    body('login', 'incorrect login').optional().isString().isLength({min: 3, max: 10})
]

export const checkValidation = (req: Request, res: Response, resultValidation) => {
    if(!resultValidation.isEmpty()){
        const errors = resultValidation.array()
        console.log(errors)
        const errorsFields: errorField[] = []
        if(!errors.length){
            errors.map((err: any) => {
                errorsFields.push({message: err.msg, field: err.path})
            })
        }
        console.log('valts' + errorsFields)
        return errorsFields || []
    }

}