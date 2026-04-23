const express = require('express');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
});

// NOTE: hasta 5 imágenes por producto
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), uploadImage);
router.delete('/', verifyToken, requireAdmin, deleteImage);

module.exports = router;