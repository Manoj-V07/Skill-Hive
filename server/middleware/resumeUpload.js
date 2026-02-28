const multer = require('multer');
const path = require('path');
const { resumesDir } = require('../config/localStorage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const base = file.originalname.replace(/\.[^/.]+$/, '');
    const filename = `resume_${req.user._id}_${Date.now()}_${base}.pdf`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
