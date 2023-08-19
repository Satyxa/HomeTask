import {videoT} from "./routes/videos";

type DbType = {
    videos: videoT[]
}

const dateNow = new Date()

export const db: DbType = {
    videos: [
        {
            id: 1,
            title: 'string',
            author: 'string',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: dateNow.toISOString(),
            publicationDate: new Date(dateNow.setDate(dateNow.getDate() + 1)).toISOString(),
            availableResolutions: [
                "P144"
            ]

        },
        {
            id: 5,
            title: 'string',
            author: 'string',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: dateNow.toISOString(),
            publicationDate: new Date(dateNow.setDate(dateNow.getDate() + 1)).toISOString(),
            availableResolutions: [
                "P144"
            ]

        },
    ]
}