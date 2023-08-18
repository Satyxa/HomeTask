"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const createVideoValidation = (errors, title, author, availableResolutions) => {
    if (!title || !title.trim() || title.length > 40) {
        errors.push({ message: 'invalid title', field: 'title' });
    }
    //todo
    if (!author || !title.trim() || title.length > 20) {
        errors.push({ message: 'invalid author', field: 'author' });
    }
    if (!availableResolutions) {
        errors.push({ message: 'invalid availableResolutions', field: 'availableResolutions' });
    }
    return errors;
};
exports.videosRouter = (0, express_1.Router)({});
exports.videosRouter.get('/', (req, res) => {
    res.status(200).send(db_1.db.videos);
});
exports.videosRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const video = db_1.db.videos.find(v => v.id === +id);
    if (!video) {
        res.sendStatus(404);
    }
    else {
        res.status(200).send(video);
    }
});
exports.videosRouter.post('/', (req, res) => {
    const { title, author, availableResolutions } = req.body;
    const errors = [];
    errors.push(createVideoValidation(errors, title, author, availableResolutions));
    if (errors.length) {
        return res.status(400).send({
            errorsMessages: errors
        });
    }
    const dateNow = new Date();
    const newVideo = {
        id: db_1.db.videos.length + 1,
        title,
        author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: dateNow.toISOString(),
        // publicationDate: dateNow + 1 day
        publicationDate: (dateNow + 1).toISOString(),
        availableResolutions
    };
    db_1.db.videos.push(newVideo);
    return res.status(201).send(newVideo);
});
exports.videosRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;
    let video = db_1.db.videos.find(v => v.id === +id);
    if (!video)
        return res.sendStatus(404);
    const errors = [];
    if (!canBeDownloaded || typeof canBeDownloaded != "boolean") {
        return errors.push({ message: 'invalid canBeDownloaded', field: 'canBeDownloaded' });
    }
    if (!minAgeRestriction || typeof minAgeRestriction != "number") {
        return errors.push({ message: 'invalid minAgeRestriction', field: 'minAgeRestriction' });
    }
    if (!publicationDate || typeof publicationDate != "string") {
        return errors.push({ message: 'invalid canBeDownloaded', field: 'canBeDownloaded' });
    }
    errors.push(createVideoValidation(errors, title, author, availableResolutions));
    if (errors.length) {
        return res.status(400).send({
            errorsMessages: errors
        });
    }
    // todo: validation
    // update
    return res.sendStatus(204);
});
exports.videosRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    let video = db_1.db.videos.find(v => v.id === +id);
    if (!video)
        return res.sendStatus(404);
    db_1.db.videos = db_1.db.videos.filter(v => v.id !== video.id);
    res.sendStatus(204);
});
