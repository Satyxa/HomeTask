"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const videos_1 = require("./routes/videos");
const app = (0, express_1.default)();
const port = process.env.PORT || 5200;
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield res.send('privet');
}));
app.use(body_parser_1.default.json());
app.use('/hometask_01/api/videos', videos_1.videosRouter);
app.listen(port, () => {
    console.log('server 5200 ok');
});
