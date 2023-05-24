import asyncHandler from "express-async-handler";
import Color from "../model/Color.js";

// @desc    Create new color
// @route   POST/api/v1/colors
//@access   Private/Admin
export const createSingleColorController = asyncHandler(async (req, res, next) => {
  const { name, user, image, products } = req.body;

  // Check if the color already exists
  const colorExists = await Color.findOne({ name });

  if (colorExists) {
    res.status(400);
    throw new Error('Color already exists');
  }

  const color = await Color.create({
    name: name.toLowerCase(),
    user: req.userAuthId,
    image,
    products
  });

  if (color) {
    res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: color
    });
  } else {
    res.status(400);
    throw new Error('Invalid color data');
  }
});


// @desc    Get all colors
// @route   GET/api/v1/colors
//@access   Public
export const getAllColorsController = asyncHandler(async (req, res) => {
    // Fetch all colors
    const colors = await Color.find();
  
    // If no colors are found, send an error response
    if (colors.length === 0) {
      return res.status(404).json({
        message: "No colors to show",
      });
    }
  
    // Send a success response with the colors array
    res.json({
      status: "success",
      results: colors.length,
      colors,
    });
  });


// @desc    Get a single color
// @route   GET/api/v1/colors
// @access   Public
export const getSingleColorController = asyncHandler(async (req, res, next) => {
    const color = await Color.findById(req.params.id).populate('products');
  
    if (color) {
      res.json({
        success: true,
        message: "Color was fetched successfully",
        data: color
      });
    } else {
      res.status(404);
      throw new Error('Color not found');
    }
  });
  
// @desc    Update a Color
// @route   PUT /api/v1/colors/:id
// @access  Private/Admin
export const updateSingleColorController = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
  
    let color = await Color.findByIdAndUpdate(
      req.params.id,
      { name: name },
      { new: true, runValidators: true }
    );
  
    if (!color) {
      res.status(404);
      throw new Error('Color not found');
    } else {
      res.json({
        success: true,
        data: color
      });
    }
  })

// @desc    Delete a Color
// @route   DELETE /api/v1/colors/:id
// @access  Private/Admin
export const deleteSingleColorController = asyncHandler(async (req, res, next) => {
  const color = await Color.findByIdAndRemove(req.params.id);

  if (!color) {
    res.status(404);
    throw new Error('Color not found');
  }

  res.json({
    success: true,
    message: "Color deleted successfully",
    data: color,
  });
});

// @desc    Delete all colors
// @route   DELETE /api/v1/colors
// @access  Private/Admin
export const deleteAllColorsController = asyncHandler(async (req, res, next) => {
    const result = await Color.deleteMany({});
  
    if (!result) {
      res.status(500);
      throw new Error('Error deleting colors');
    } else {
      res.json({
        success: true,
        message: "All colors deleted successfully",
      });
    }
});
