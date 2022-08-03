const express = require("express");
require("@prisma/client");
require("dotenv").config();
const route = require("./route");
const path = require("path");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require('multer');
const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use(methodOverride('_method'));

const mongoURI = 'mongodb+srv://henry:duykhai99@cluster0.yo9wflm.mongodb.net/?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI);
// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = Grid(conn.db,mongoose.mongo);
  gfs.collection("uploads");
});

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({ storage });

app.post("/api/upload",upload.single("file"),(req,res)=>{
    res.json({file : req.file})
})
//GET /files
app.get('/api/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    // Files exist
    return res.json(files);
  });
});
//GET /files/:filename
app.get('api/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

//import router
const routes = require("./route");


// ROUTE
app.use("/", routes);


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
