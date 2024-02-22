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
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerUploadImage = void 0;
const { Datastore } = require("@google-cloud/datastore");
const { Storage } = require('@google-cloud/storage');
const { request: Req } = require('express');
const { response: Res } = require('express');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });
const storage = new Storage({
    projectId: "scg-iat-project-coretech",
    keyFilename: path.join(__dirname, "../../key.json"),
});
const datastore = new Datastore();
const BUCKET = process.env.BUCKET;
const KIND = process.env.KIND_SING_TASK;
const bucket = storage.bucket(BUCKET);
const controllerUploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const data = req.fields
    const imageDetail = req.file;
    const date = new Date();
    const ms = date.getTime();
    try {
        const taskKey = datastore.key([KIND]);
        const imageID = `${ms}_${imageDetail.originalname}`;
        const task = {
            key: taskKey,
            data: {
                createDate: ms,
                ordinal: 0,
                imageName: `${imageDetail.originalname}`,
                imageID: imageID
            }
        };
        yield datastore.save(task);
        const file = bucket.file(imageID);
        const stream = file.createWriteStream({
            metadata: {
                contentType: imageDetail.mimetype,
            },
        });
        stream.on('error', (err) => {
            console.error('Error uploading to Google Cloud Storage:', err);
            res.status(500).send('Error uploading image.');
        });
        stream.on('finish', () => {
            console.log('Image uploaded to Google Cloud Storage:', imageID);
            res.status(200).send('Image uploaded successfully.');
        });
        stream.end(imageDetail.buffer);
    }
    catch (err) {
        console.log("error => ", err);
        res.send(err);
    }
});
exports.controllerUploadImage = controllerUploadImage;
