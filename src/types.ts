export type userT = {
    id: string
    email: string
    login: string
    passwordHash: string
    passwordSalt: string
    createdAt: string
}

export type errorField = {
    field: string
    message: string
}

export type userLoginT = {
    password: string
    loginOrEmail: string
}

export type userViewT = {
    id: string
    email: string
    username: string
    createdAt: string
}

export type pagSortT = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    searchNameTerm: string,
    totalCount: number,
    pagesCount: number
}



export type postT = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    comments: commentsT[]
}

export type commentsT = {
    postId: string
    userId: string
    userLogin: string
    id: string
    content: string
    createdAt: string
}

export type commentatorInfoT = {
    userId: string
    userLogin: string
}

export type blogsT = {
    id: string
    name: string
    description: string
    websiteUrl: string
    isMembership: boolean
    createdAt: string
}

export type videoT = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: Array<'P144' | 'P240' | 'P360' | 'P480' | 'P720' | 'P1080' | 'P1440' | 'P2160'>
}

export type updatedVideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<string>
}

export type ValidationErrorType = {
    message: string
    field: string
}
