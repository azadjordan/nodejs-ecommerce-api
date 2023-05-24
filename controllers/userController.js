import User from "../model/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verify } from "jsonwebtoken";
import { verifyToken } from "../utils/verifyToken.js";
import validator from "validator";

// @descreption   Register user
// @route         POST /api/v1/users/register
// @access        Private/Admin
export const registerUserController = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!email || !password || !fullname) {
    throw Error("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  // if (!validator.isStrongPassword(password)){
  //     throw Error('Please use a stronger password')
  // }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    // throw
    throw new Error("User already exists");
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // create the user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
  });
  res.status(201).json({
    status: "success",
    message: "User Registered Successfully",
    data: user,
  });
});

// @descreption   Login user
// @route         POST /api/v1/users/login
// @access        Public
export const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  // Find user in db by email only
  const userFound = await User.findOne({
    email,
  });

  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    //userFound && userFound.password
    return res.json({
      status: "success",
      message: "User logged in successfully",
      userFound,
      token: generateToken(userFound?._id),
    });
  } else {
    throw new Error(`Invalid credentials`);
  }
});

// @descreption   Get user profile
// @route         GET /api/v1/users/profile
// @access        Private
export const getUserProfileController = asyncHandler(async (req, res) => {
  // find the user
  const user = await User.findById(req.userAuthId).populate('orders')
  res.json({
    status: "success",
    message: "User profile fetched successfully",
    data: user ? user : "No registered users to display"
  })
});

// @description   Get all users
// @route         GET /api/v1/users
// @access        Private/Admin
export const getAllUsersController = asyncHandler(async (req, res) => {
  // Fetch all users from the database
  const users = await User.find();

  // If no users are found, return a specific message
  if (users.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No registered users found."
    });
  }

  // If users are found, return them
  res.status(200).json({
    status: "success",
    data: users,
  });
});

// @description   Get user by ID
// @route         GET /api/v1/users/:id
// @access        Private/Admin
export const getUserByIdController = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// @description   Update user shipping address
// @route         GET /api/v1/users/update/shipping
// @access        Private/Admin
export const updateShippingAddressController = asyncHandler(async(req,res)=>{
  const {firstName, lastName, address, city, postalCode, province, phone} = req.body
  const user = await User.findByIdAndUpdate(req.userAuthId, {
    shippingAddress:{
      firstName, lastName, address, city, postalCode, province, phone
    },
    hasShippingAddress: true

  }, {new: true})

  // send the response
   res.json({
    status: "success",
    message: "User shipping address updated successfully",
    user
   })
})