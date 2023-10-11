import {BlogModel} from "./db/BlogModel";
import {CommentModel} from "./db/CommentModel";
import {PostModel} from "./db/PostModel";
import {UserModel} from "./db/UserModel";

export const paginationSort = async (req: any) => {
    let sortDirection: 'desc' | 'asc' = "desc"
    if(req.query.sortDirection){
        if(req.query.sortDirection === 'asc'){
            sortDirection = 'asc'
        }
    }
    return {
        pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
        pageSize: req.query.pageSize ? +req.query.pageSize : 10,
        sortBy: req.query.sortBy  ? req.query.sortBy : 'createdAt',
        searchNameTerm: req.query.searchNameTerm as string,
        searchLoginTerm: req.query.searchLoginTerm as string,
        searchEmailTerm: req.query.searchEmailTerm as string,
        sortDirection,
    }
}

export const postPagAndSort = async(filter = {}, sortBy, sortDirection, pageSize, pageNumber) => {
    return PostModel
        .find(filter, { projection: { _id:0, comments:0, 'extendedLikesInfo.newestLikes': 3 }})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
}

export const blogPagAndSort = async(filter, sortBy, sortDirection, pageSize, pageNumber) => {
    return BlogModel
        .find(filter, { projection : { _id:0 }})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
}

export const commentsPagAndSort = async(filter, sortBy, sortDirection, pageSize, pageNumber) => {
    return  CommentModel
        .find(filter, { projection : { _id:0, postId: 0 }})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
}

export const usersPagAndSort = async(filter, sortBy, sortDirection, pageSize, pageNumber) => {
    return  UserModel
        .find(filter, { projection : { _id:0, passwordHash: 0, passwordSalt: 0 }})
        .sort({[sortBy]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
}