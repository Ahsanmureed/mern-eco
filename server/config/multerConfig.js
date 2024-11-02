import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dzvbswnyn',
  api_key: '957968242874789',
  api_secret: 'L8L_lanAHtkAu6n3TiBNQtQXiuE',
});

// Function to generate a random string
const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length);
};

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => {
      // Use a combination of timestamp and a random string for uniqueness
      return `${Date.now()}_${generateRandomString(8)}${path.extname(file.originalname)}`;
    },
  },
});

// Configure Multer
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

export default upload;
