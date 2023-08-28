import {Filter} from "mongodb";
import {pagSortT, userT} from "./types";
import {patreonUsers} from "./db/db";


export const paginationSort = async (req: any) => {
    return {
        pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
        pageSize: req.query.pageSize ? +req.query.pageSize : 10,
        sortBy: req.query.sortBy  ? req.query.sortBy : 'createdAt',
        searchNameTerm: req.query.searchNameTerm as string,
        searchLoginTerm: req.query.searchLoginTerm as string,
        searchEmailTerm: req.query.searchEmailTerm as string,
    }
}