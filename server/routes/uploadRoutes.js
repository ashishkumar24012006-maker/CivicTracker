const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary if credentials present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    // If Cloudinary configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'civictrack_reports',
      });

      // Cleanup local temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    // Otherwise return local static URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      url: fileUrl,
      publicId: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload multiple images (up to 5)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded',
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'civictrack_reports',
        });
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      } else {
        uploadedFiles.push({
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
        });
      }
    }

    res.status(200).json({
      success: true,
      images: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
