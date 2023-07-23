import Image from '../model/Image.js'
import asyncHandler from 'express-async-handler';
import Category from '../model/Category.js';
import Product from '../model/Product.js';
import fs from 'fs';
import AWS from "aws-sdk";
import dotenv from 'dotenv'
dotenv.config()

// Create an instance of the AWS.S3 class
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// @desc    Get all images
// @route   GET /api/v1/images
// @access  Private
export const getAllImagesController = asyncHandler(async (req, res) => {
  const images = await Image.find(); // Retrieve all images from the database
  const count = images.length; // Get the count of images

  res.status(200).json({ count, images }); // Send the count and images as a JSON response
});

// @desc    Delete all images
// @route   DELETE /api/v1/images
// @access  Private
export const deleteAllImagesController = asyncHandler(async (req, res) => {
    // Fetch all Image documents
    const images = await Image.find();
  
    // Loop through each Image document and delete the image from S3
    for (const image of images) {
      const params = {
        Bucket: image.bucket,
        Key: image.key,
      };
  
      try {
        await s3.deleteObject(params).promise(); // Delete image from S3
      } catch (error) {
        res.status(500);
        throw new Error('Failed to delete images from S3');
      }
    }
  
    // Delete all Image documents from MongoDB
    await Image.deleteMany();

    // Set the `image` property of all `Category` and `Product` documents to a default URL
    const defaultImageUrl = 'https://via.placeholder.com/150';
    await Category.updateMany({}, { 'image.url': defaultImageUrl });
    await Product.updateMany({}, { 'images.$[].url': defaultImageUrl });

    res.status(200).json({ message: 'All images have been deleted from S3 and MongoDB and all categories and products have been updated with the default image URL.' });
});
  

// @desc    Delete a single image from a product
// @route   DELETE /api/v1/images/:imageId/product/:productId
// @access  Private/Admin
export const deleteSingleImageController = asyncHandler(async(req, res, next)=>{
  const { imageId, productId } = req.params;

  // Fetch the image and product from the database
  const image = await Image.findById(imageId);
  const product = await Product.findById(productId);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Deleting the image from the S3 bucket
  const params = {
    Bucket: image.bucket,
    Key: image.key,  // key is the filename in the S3 bucket
  };

  try {
    // Delete the image from the S3 bucket
    await s3.deleteObject(params).promise();

    // If successful, delete the Image record from the database
    await Image.findByIdAndDelete(imageId);

    // Then, remove the Image from the Product
    product.images = product.images.filter(img => img.id.toString() !== imageId.toString());
    await product.save();

    res.json({
      success: true,
      message: 'Image and its reference in the product deleted successfully'
    });
  } catch (err) {
    // An error occurred during the image deletion process, so throw an error
    return next(err);
  }
});


