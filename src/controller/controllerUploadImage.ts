const { Datastore } = require("@google-cloud/datastore");
const { Storage } = require('@google-cloud/storage');
const { request: Req } = require('express');
const { response: Res } = require('express');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });

const storage = new Storage(
    {
        projectId: "scg-iat-project-coretech",
        keyFilename: path.join(__dirname, "../../key.json"),
    }
);
const datastore = new Datastore();

const BUCKET = process.env.BUCKET;
const KIND = process.env.KIND_SING_TASK;

const bucket = storage.bucket(BUCKET);

const controllerUploadImage = async (req: typeof Req, res: typeof Res) => {
    // const data = req.fields
    const imageDetail = req.file
    const date = new Date();
    const ms = date.getTime();

    try {


        const taskKey = datastore.key([KIND])
        const imageID = `${ms}_${imageDetail.originalname}`

        const task = {
            key: taskKey,
            data: {
                createDate: ms,
                ordinal: 0,
                imageName: `${imageDetail.originalname}`,
                imageID: imageID
            }
        }

        await datastore.save(task);

        const file = bucket.file(imageID);
        const stream = file.createWriteStream({
            metadata: {
                contentType: imageDetail.mimetype,
            },
        });

        stream.on('error', (err:any) => {
            console.error('Error uploading to Google Cloud Storage:', err);
            res.status(500).send('Error uploading image.');
        });

        stream.on('finish', () => {
            console.log('Image uploaded to Google Cloud Storage:', imageID);
            res.status(200).send('Image uploaded successfully.');
        });

        stream.end(imageDetail.buffer);

    } catch (err) {
        console.log("error => ",err);
        res.send(err);
    }

}

export { controllerUploadImage }