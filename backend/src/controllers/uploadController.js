const cloudinary = require('../config/cloudinary');

// ─── Subir imagen ──────────────────────────────────────────────────────────
const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen' });
    }

    const uploads = await Promise.all(
      req.files.map((file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        return cloudinary.uploader.upload(dataURI, {
          folder: 'eltucanpesca/products',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        });
      })
    );

    // NOTE: devuelve array de { url, publicId } — uno por cada imagen subida
    res.json(uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id })));
  } catch (error) {
    res.status(500).json({ message: 'Error al subir las imágenes', error: error.message });
  }
};

// ─── Eliminar imagen ───────────────────────────────────────────────────────
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: 'Se requiere publicId' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la imagen', error: error.message });
  }
};

module.exports = { uploadImage, deleteImage };