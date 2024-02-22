const express = require("express");
const bodyParser = require('body-parser')
const cors = require("cors");
const { controllerDebug } = require("../controller/controllerDebug")
const { controllerUploadImage } = require("../controller/controllerUploadImage")
const { controllerUploadMutiImg } = require("../controller/controllerUploadMutiImg")

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors(
    { origin: '*' }
));


app.get("/api/debug", controllerDebug)
// app.post("/api/upload/content", upload.single("image") ,async (req:any, res:any) => {
//   const setPath = path.join(__dirname, "../../key.json");
//   console.log(setPath);
//   const setImage = req.file;
//   console.log(setImage);
//   res.send("ok")
// });


app.post("/api/upload/content", upload.single("image"), controllerUploadImage);
app.post("/api/upload/contents", upload.array("image", 6), controllerUploadMutiImg);


export { app }