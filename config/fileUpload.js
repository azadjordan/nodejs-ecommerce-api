import dotenv from 'dotenv'
dotenv.config()
import cloudinaryPackage from 'cloudinary'
const cloudinary = cloudinaryPackage.v2
import multer from 'multer'
import {CloudinaryStorage} from 'multer-storage-cloudinary'



// Environment variables needed to configure Cloudinary
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET_KEY,
} = process.env;

// Check that all the required environment variables are set
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET_KEY) {
  throw new Error('Missing required environment variables for Cloudinary configuration');
}

// Configure Cloudinary with the environment variables
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET_KEY,
});

// create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats:['jpg', 'png', 'jpeg'],
  params: {
    folder: "ecommerce"
  }
})

// Init multer with storage engine
const upload = multer({
  storage: storage
})

export default upload
