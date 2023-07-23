import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Image from "../model/Image.js";
import dotenv from 'dotenv'
import { uploadImagesToS3 } from "../utils/imageUploader.js";
import { clearUploadDirectory } from "../utils/clearUploadDirectory.js";
import s3 from "../config/s3.js";
dotenv.config()

// @desc    Create new Category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createSingleCategoryController = asyncHandler(async (req, res, next) => { // <-- include 'next' in the arguments
  const { name } = req.body;

  // Check if category already exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    clearUploadDirectory(req)
    return res.status(400).json({
      success: false,
      message: "Category already exists",
    });
  }

  // Upload image to S3 and create Image document
  let imageObj = null;
  if (req.file) {
    const images = await uploadImagesToS3([req.file], req);
    imageObj = images[0]; // get the first image from the array
  }

  // Create the category with the uploaded image
  const category = await Category.create({
    name: name.toLowerCase(),
    user: req.userAuthId,
    image: imageObj, // This now contains the object of image id and url
    products: [], // Initialize as empty array
  });

  // Send response
  res.json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// @desc    Delete a Category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteSingleCategoryController = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (category.image && category.image.id) {
    const image = await Image.findById(category.image.id);

    if (image) {
      const params = {
        Bucket: image.bucket,
        Key: image.key,
      };

      await s3.deleteObject(params).promise(); // Delete image from S3
      await Image.findByIdAndDelete(image._id); // Delete Image document
    }
  }

  await Category.findByIdAndDelete(categoryId); // Delete Category document

  res.json({
    success: true,
    message: 'Category and associated image deleted successfully',
  });
});

// @desc    Get all categories
// @route   GET/api/v1/categories
//@access   Public
export const getAllCategoriesController = asyncHandler(async (req, res) => {
    // Fetch all categories
    const categories = await Category.find();
  
    // If no categories are found, send an error response
    if (categories.length === 0) {
      return res.status(404).json({
        message: "No categories to show",
      });
    }
  
    // Send a success response with the categories array
    res.json({
      status: "success",
      results: categories.length,
      categories,
    });
  });

// @desc    Get a single category
// @route   GET/api/v1/categories
// @access   Public
export const getSingleCategoryController = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).populate('products');
  
    if (category) {
      res.json({
        success: true,
        message: "Category was fetched successfully",
        data: category
      });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  });
  
// @desc    Update a Category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateSingleCategoryController = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // If a new file is uploaded
  if (req.file) {
    // If an old image exists, delete it from S3
    if (category.image && category.image.id) {
      const image = await Image.findById(category.image.id);

      if (image) {
        const params = {
          Bucket: image.bucket,
          Key: image.key,
        };

        await s3.deleteObject(params).promise(); // Delete image from S3
        await Image.findByIdAndDelete(image._id); // Delete Image document
      }
    }

    // Upload the new image to S3 and create Image document
    const images = await uploadImagesToS3([req.file], req);
    const newImage = images[0]; // get the first image from the array

    category.image = newImage;
  }

  category.name = name.toLowerCase();
  await category.save();

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete all categories
// @route   DELETE /api/v1/categories
// @access  Private/Admin
export const deleteAllCategoriesController = asyncHandler(async (req, res, next) => {
  // Find all categories to get their images
  const categories = await Category.find();

  // Loop through each category and delete its image from S3
  for (const category of categories) {
    if (category.image && category.image.id) {
      const image = await Image.findById(category.image.id);

      if (image) {
        const params = {
          Bucket: image.bucket,
          Key: image.key,
        };

        await s3.deleteObject(params).promise(); // Delete image from S3
        await Image.findByIdAndDelete(image._id); // Delete Image document
      }
    }
  }

  // Delete all categories from the database
  await Category.deleteMany({});

  res.json({
    success: true,
    message: "All categories and associated images deleted successfully",
  });
});

