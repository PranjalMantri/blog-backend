import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
