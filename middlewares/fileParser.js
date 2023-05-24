// fileParser.js
import multer from 'multer';

const multerStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileParser = multer({ storage: multerStorage });

export default fileParser;
