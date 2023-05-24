import asyncHandler from "express-async-handler";
import Brand from "../model/Brand.js";

// @desc    Create new brand
// @route   POST/api/v1/brands
//@access   Private/Admin
export const createSingleBrandController = asyncHandler(async (req, res, next) => {
  const { name, user, image, products } = req.body;

  // Check if the brand already exists
  const brandExists = await Brand.findOne({ name });

  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }

  const brand = await Brand.create({
    name: name.toLowerCase(),
    user: req.userAuthId,
    image,
    products
  });

  if (brand) {
    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand
    });
  } else {
    res.status(400);
    throw new Error('Invalid brand data');
  }
});


// @desc    Get all brands
// @route   GET/api/v1/brands
//@access   Public
export const getAllBrandsController = asyncHandler(async (req, res) => {
    // Fetch all brands
    const brands = await Brand.find();
  
    // If no brands are found, send an error response
    if (brands.length === 0) {
      return res.status(404).json({
        message: "No brands to show",
      });
    }
  
    // Send a success response with the brands array
    res.json({
      status: "success",
      results: brands.length,
      brands,
    });
  });


// @desc    Get a single brand
// @route   GET/api/v1/brands
// @access   Public
export const getSingleBrandController = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id).populate('products');
  
    if (brand) {
      res.json({
        success: true,
        message: "Brand was fetched successfully",
        data: brand
      });
    } else {
      res.status(404);
      throw new Error('Brand not found');
    }
  });
  
// @desc    Update a Brand
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
export const updateSingleBrandController = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
  
    let brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name: name },
      { new: true, runValidators: true }
    );
  
    if (!brand) {
      res.status(404);
      throw new Error('Brand not found');
    } else {
      res.json({
        success: true,
        data: brand
      });
    }
  })

// @desc    Delete a Brand
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
export const deleteSingleBrandController = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndRemove(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.json({
    success: true,
    message: "Brand deleted successfully",
    data: brand,
  });
});

// @desc    Delete all brands
// @route   DELETE /api/v1/brands
// @access  Private/Admin
export const deleteAllBrandsController = asyncHandler(async (req, res, next) => {
  const result = await Brand.deleteMany({});

  if (!result) {
    res.status(500);
    throw new Error('Error deleting brands');
  } else {
    res.json({
      success: true,
      message: "All brands deleted successfully",
    });
  }
});
