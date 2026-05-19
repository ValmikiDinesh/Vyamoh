const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let uploadImages, uploadVideos;

if (isCloudinaryConfigured) {
  // Initialize Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Multer storage for images
  const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'vyamoh/products',
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
    },
  });

  // Multer storage for videos
  const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'vyamoh/videos',
      resource_type: 'video',
    },
  });

  uploadImages = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  uploadVideos = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  });
} else {
  console.log('⚠️ Cloudinary credentials missing. Falling back to local disk storage in /uploads');
  
  const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  uploadImages = multer({
    storage: localDiskStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  uploadVideos = multer({
    storage: localDiskStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  });
}

// Delete asset from Cloudinary
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!isCloudinaryConfigured) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return null;
  }
};

// Get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured) return '';
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
};

// Generate video thumbnail
const getVideoThumbnail = (publicId) => {
  if (!isCloudinaryConfigured) return '';
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [{ width: 640, height: 360, crop: 'fill', quality: 'auto' }],
  });
};

module.exports = {
  cloudinary,
  uploadImages,
  uploadVideos,
  deleteAsset,
  getOptimizedUrl,
  getVideoThumbnail,
};
