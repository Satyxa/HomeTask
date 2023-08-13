"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const express_1 = require("express");
exports.videosRouter = (0, express_1.Router)({});
const videos = [
    { id: '1', title: 'hi', description: 'my first video' },
    { id: '2', title: 'hihi', description: 'my second video' },
    { id: '3', title: 'hihihi', description: 'my third video' }
];
exports.videosRouter.get('/', (req, res) => {
    res.status(200).send(videos);
});
exports.videosRouter.post('/', (req, res) => {
    const { title, description, id } = req.body;
    const createdVideo = {
        id,
        title,
        description
    };
    videos.push(createdVideo);
    res.status(200).send({ videos, createdVideo });
});
exports.videosRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const video = videos.filter((item) => item.id === id);
    if (video) {
        video[0].title = req.body.title;
        res.status(200).send({ videos, video });
    }
    else {
        res.status(404);
    }
});
exports.videosRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const filterVideos = videos.filter((v) => v.id !== id);
    res.status(204).send(filterVideos);
});
