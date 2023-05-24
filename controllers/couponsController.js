import asyncHandler from "express-async-handler";
import Coupon from "../model/Coupon.js";


// @desc    Create new Coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
export const createCouponController = asyncHandler(async(req,res)=>{
    const {code, startDate, endDate, discount} = req.body
    // check if admin
    // check if coupon already exists
    const couponsExists = await Coupon.findOne({
        code: code
    }) 
    if(couponsExists){
        throw new Error("Coupon already exists")
    }
    // check if the discount is a number
    if(isNaN(discount)){
        throw new Error("Discount value must be a number")
    }
    // create coupon
    const coupon = await Coupon.create({
        code: code?.toUpperCase(),
        startDate, 
        endDate, 
        discount, 
        user: req.userAuthId
    })
    // send the response
    res.status(201).json({
        status: "success",
        message: "Coupon created successfully",
        coupon
    })

})

// @desc    Get all Coupon
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getAllCouponsController = asyncHandler(async(req, res, next) => {
    if(!req) {
        throw new Error('Request is missing');
    }

    const coupons = await Coupon.find();
    const count = await Coupon.countDocuments();

    if(count === 0) {
        res.status(200).json({
            status: "success",
            message: "No coupons available at the moment",
            count
        })
    } else {
        res.status(200).json({
            status: "success",
            message: "All coupons",
            count,
            coupons
        })
    }
});


// @desc    Get a single Coupon
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin
export const getSingleCouponController = asyncHandler(async (req, res, next) => {
    if(!req) {
        throw new Error('Request is missing');
    }
    if(!req.params || !req.params.id) {
        throw new Error('Missing coupon ID in request');
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    res.status(200).json({
        status: "success",
        message: "Coupon retrieved successfully",
        coupon
    });
});

// @desc    Update a single Coupon
// @route   PUT /api/v1/coupons/:id/update
// @access  Private/Admin
export const updateSingleCouponController = asyncHandler(async (req, res, next) => {
    if(!req) {
        throw new Error('Request is missing');
    }
    if(!req.body) {
        throw new Error('Request body is missing');
    }
    if(!req.params || !req.params.id) {
        throw new Error('Missing coupon ID in request');
    }

    const { code, startDate, endDate, discount } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    coupon.code = code?.toUpperCase() || coupon.code;
    coupon.startDate = startDate || coupon.startDate;
    coupon.endDate = endDate || coupon.endDate;
    coupon.discount = discount || coupon.discount;
    coupon.user = req.userAuthId;

    const updatedCoupon = await coupon.save();
    res.status(200).json({
        status: "success",
        message: "Coupon updated successfully",
        updatedCoupon
    });
});

// @desc    Delete a single Coupon
// @route   DELETE /api/v1/coupons/:id/delete
// @access  Private/Admin
export const deleteSingleCouponController = asyncHandler(async (req, res, next) => {
    if(!req) {
        throw new Error('Request is missing');
    }
    if(!req.params || !req.params.id) {
        throw new Error('Missing coupon ID in request');
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!deletedCoupon) {
        throw new Error('Coupon not found');
    }

    res.status(200).json({
        status: "success",
        message: "Coupon deleted successfully",
        deletedCoupon
    });
});



// @desc    Delete all Coupons
// @route   DELETE /api/v1/coupons/deleteall
// @access  Private/Admin
export const deleteAllCouponsController = asyncHandler(async (req, res, next) => {
    if(!req) {
        throw new Error('Request is missing');
    }

    await Coupon.deleteMany({});
    
    res.status(200).json({
        status: "success",
        message: "All coupons deleted successfully",
    });
});


