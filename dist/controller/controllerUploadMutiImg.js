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
exports.controllerUploadMutiImg = void 0;
const { request: Req } = require('express');
const { response: Res } = require('express');
const { Datastore } = require("@google-cloud/datastore");
const { Storage } = require('@google-cloud/storage');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });
const PROJECT_ID = process.env.PROJECT_ID;
const BUCKET = process.env.BUCKET;
const KIND = process.env.KIND_MUTI_TASK;
const storage = new Storage({
    projectId: PROJECT_ID,
    keyFilename: path.join(__dirname, "../../key.json"),
});
const datastore = new Datastore();
const bucket = storage.bucket(BUCKET);
const controllerUploadMutiImg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const ms = date.getTime();
    let fileName = [];
    try {
        const files = req.files;
        const jsonData = JSON.parse(req.body.data);
        if (!files || files.length === 0) {
            res.status(400).send("No image upload.");
        }
        if (files.length > 6) {
            res.status(400).send("Image in product max is 6");
        }
        files.forEach((element) => {
            fileName.push(element.originalname);
        });
        const taskKey = datastore.key([KIND]);
        const task = {
            key: taskKey,
            data: {
                createDate: ms,
                title: jsonData.title,
                intro: jsonData.intro,
                content: jsonData.content,
                price: JSON.stringify(jsonData.prices),
                images: fileName
            }
        };
        // console.log(task)
        yield datastore.save(task);
        const uploadPromise = files.map((file) => {
            const blob = bucket.file(file.originalname);
            const stream = blob.createWriteStream({
                metadata: {
                    ContentType: file.mimetype
                }
            });
            return new Promise((resolve, reject) => {
                stream.on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
                stream.on('finish', () => {
                    console.log("Finish upload");
                    // resolve()
                    res.status(200).send('Files uploaded successfully.');
                });
                stream.end(file.buffer);
            });
        });
        yield Promise.all(uploadPromise);
        res.status(200).send('Files uploaded successfully.');
        // console.log(files)
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
exports.controllerUploadMutiImg = controllerUploadMutiImg;
