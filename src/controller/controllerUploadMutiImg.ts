const { request: Req } = require('express');
const { response: Res } = require('express');
const { Datastore } = require("@google-cloud/datastore");
const { Storage } = require('@google-cloud/storage');

const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });

const PROJECT_ID = process.env.PROJECT_ID
const BUCKET = process.env.BUCKET
const KIND = process.env.KIND_MUTI_TASK

const storage = new Storage(
    {
        projectId: PROJECT_ID,
        keyFilename: path.join(__dirname, "../../key.json"),
    }
)


const datastore = new Datastore();
const bucket = storage.bucket(BUCKET);

const controllerUploadMutiImg = async (req: typeof Req, res: typeof Res) => {

    const date = new Date();
    const ms = date.getTime();
    let fileName: string[] = []
    try {
        const files = req.files;
        const jsonData = JSON.parse(req.body.data);
        if (!files || files.length === 0) {
            res.status(400).send("No image upload.")
        }

        if (files.length > 6) {
            res.status(400).send("Image in product max is 6")
        }


        files.forEach((element: any) => {
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
        }
        // console.log(task)
        await datastore.save(task);

        const uploadPromise = files.map((file: any) => {
            const blob = bucket.file(file.originalname);
            const stream = blob.createWriteStream({
                metadata: {
                    ContentType: file.mimetype
                }
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (err: any) => {
                    console.error(err);
                    reject(err);
                });

                stream.on('finish', () => {
                    console.log("Finish upload")
                    // resolve()
                    res.status(200).send('Files uploaded successfully.');
                });

                stream.end(file.buffer);
            });
        });

        await Promise.all(uploadPromise)
        res.status(200).send('Files uploaded successfully.');
        // console.log(files)
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
}

export { controllerUploadMutiImg }