const multer = require("multer");
const ErrorResponse = require("../utils/errorResponse");
const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
      return cb(new ErrorResponse("Please upload an image file", 400));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
