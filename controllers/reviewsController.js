import asyncHandler from "express-async-handler"
import Review from "../model/Review.js"
import Product from '../model/Product.js'

// @desc    Create new review
// @route   POST /api/v1/reviews
// @access  Private/Admin
export const createSingleReviewController = asyncHandler(async(req,res)=>{
    const {product, message, rating} = req.body
    //1. Find the product
    const {productID} = req.params
    const productFound = await Product.findById(productID).populate('reviews')
    if(!productFound){
        throw new Error("Product not found")
    }
    // check if user already reviewd this product
    const hasReviewd = productFound?.reviews?.find((review)=>{
      return review?.user.toString() === req.userAuthId.toString()
    })
    if (hasReviewd){
      throw new Error("You have already reviewed this product")
    }
    const existingReview = await Review.findOne({
        product: productFound._id,
        user: req.userAuthId,
      });
    
      if (existingReview) {
        throw new Error("User has already reviewed this product");
      }
    // create review
    const review = await Review.create({
        message,
        rating,
        product: productFound?._id,
        user: req.userAuthId,
    })
    // Push review into product found
    productFound.reviews.push(review?._id)
    // resave
    await productFound.save()
    res.status(201).json({
        success: true,
        message: "Review created successfully"
    })
})

// @desc    Delete all reviews
// @route   DELETE /api/v1/reviews/deleteall
// @access  Private/Admin
export const deleteAllReviewsController = asyncHandler(async (req, res) => {
  await Review.deleteMany();
  res.status(200).json({
    success: true,
    message: "All reviews deleted successfully",
  });
});

