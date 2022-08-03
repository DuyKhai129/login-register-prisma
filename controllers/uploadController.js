const Files = require("../model/fileModel");
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');

const uploadController = {
  //get all user
  uploadFile: async (req, res, next) => {
    try {
// check for existing images
const file =  Files.findOne({ caption: req.body.caption })
if (file) {
  return res.status(200).json({
      success: false,
      message: 'file already exists',
  });
}
let newFile = new Files({
  caption: req.body.caption,
  filename: req.file.filename,
  fileId: req.file.id,
});
newFile.save()
res.status(200).json({
  success: true,
  file,
});
    } catch (err) {
      next(err);
    }
  },
};
module.exports = uploadController;
