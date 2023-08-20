import {videoT} from "./routes/videos";
import {blogsT} from './routes/blogs'
import {postT} from "./routes/posts";
type DbType = {
    videos: videoT[]
    blogs: blogsT[]
    posts: postT[]
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
            id: 2,
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
    ],
    blogs: [
        {
            id: "1",
            name: "firstblog",
            description: "frstbdesk",
            websiteUrl: "https://j22eJF112tD9-YEjogibv5oE8IPppe06Bd_7A-TBk1zBI5CL9W09VOLfeCLatT63o4asL1tmwd43ENWlun6X.q-0fbZNm0q5"
        },
        {
            id: "2",
            name: "firs1111tblog",
            description: "frs1111bdesk",
            websiteUrl: "https://jeJF1tD34349-YEjogibv5oE8IPppe06Bd_7A-TBk1zBI5CL9W09VOLfeCLatT63o4asL1tmwd43ENWlun6X.q-0fbZNm0q5"
        }
    ],
    posts: [
        {
            id: '1',
            title: 'some title 1',
            shortDescription: 'some desc 1',
            content: 'some content 1',
            blogId: '1',
            blogName: 'some name 1',
        },
        {
            id: '2',
            title: 'some title 2',
            shortDescription: 'some desc 2',
            content: 'some content 2',
            blogId: '2',
            blogName: 'some name 2',
        }
    ]
}