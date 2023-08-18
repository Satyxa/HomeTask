import {videoT} from "./routes/videos";

type DbType = {
    videos: videoT[]
}


export const db: DbType = {
    videos: [
        {
            id: 1,
            title: 'string',
            author: 'string',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-08-17T14:01:13.893Z",
            publicationDate: "2023-08-17T14:01:13.893Z",
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
            createdAt: "2023-08-17T14:01:13.893Z",
            publicationDate: "2023-08-17T14:01:13.893Z",
            availableResolutions: [
                "P144"
            ]

        },
    ]
}