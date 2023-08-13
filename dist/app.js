"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const videos_1 = require("./routes/videos");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/videos', videos_1.videosRouter);
app.listen(5200, () => {
    console.log('err');
});
