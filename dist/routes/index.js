"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videosRouter = (0, express_1.Router)({});
const videos = [
    { title: 'hi', description: 'my first video' },
    { title: 'hihi', description: 'my second video' },
    { title: 'hihihi', description: 'my third video' }
];
videosRouter.get('/', (req, res) => {
    res.sendStatus(200).send(videos);
});
