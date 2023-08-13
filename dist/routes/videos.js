"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const express_1 = require("express");
exports.videosRouter = (0, express_1.Router)({});
let videos = [
    {
        id: '1',
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
        id: '5',
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
];
exports.videosRouter.get('/', (req, res) => {
    res.status(200).send(videos);
});
exports.videosRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const video = videos.filter(v => v.id === id);
    if (!video.length) {
        res.sendStatus(404);
    }
    else if (video) {
        res.status(200).send(video);
    }
});
exports.videosRouter.post('/', (req, res) => {
    const { title, author, availableResolutions } = req.body;
    if (title && author && availableResolutions) {
        res.status(201).send({
            id: '',
            title,
            author,
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-08-17T14:01:13.893Z",
            publicationDate: "2023-08-17T14:01:13.893Z",
            availableResolutions
        });
    }
    else {
        res.status(400).send({
            errorsMessages: [
                {
                    message: "string",
                    field: "string"
                }
            ]
        });
    }
});
exports.videosRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    let video = videos.filter((v) => v.id === id);
    if (video.length === 0) {
        res.status(404).send({
            errorsMessages: [
                {
                    message: "string",
                    field: "string"
                }
            ]
        });
    }
    const updatedVideo = {
        id: '1',
        title: req.body.title || video[0].title,
        author: req.body.author || video[0].author,
        canBeDownloaded: req.body.canBeDownloaded === null ? video[0].canBeDownloaded : req.body.canBeDownloaded,
        minAgeRestriction: req.body.minAgeRestriction === undefined ? video[0].minAgeRestriction : req.body.minAgeRestriction,
        createdAt: "2023-08-17T14:01:13.893Z" || video[0].createdAt,
        publicationDate: req.body.publicationDate || video[0].publicationDate,
        availableResolutions: req.body.availableResolutions || video[0].availableResolutions
    };
    if (!req.body) {
        res.sendStatus(204);
    }
    else if (req.body) {
        res.status(200).send(updatedVideo);
    }
});
exports.videosRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const filterVideos = videos.filter((v) => v.id === id);
    if (filterVideos.length === 0) {
        res.sendStatus(404);
    }
    res.sendStatus(204);
});
