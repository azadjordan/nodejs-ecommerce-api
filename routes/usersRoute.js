import express from "express";
import {
  registerUserController,
  loginUserController,
  getUserProfileController,
  getUserByIdController,
  getAllUsersController,
  updateShippingAddressController,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";


const userRoutes = express.Router();

userRoutes.get("/allusers", isLoggedIn, isAdmin, getAllUsersController);
userRoutes.put("/update/shipping",isLoggedIn, updateShippingAddressController);
userRoutes.post("/register", registerUserController);
userRoutes.post("/login", loginUserController);
userRoutes.get("/profile", isLoggedIn, getUserProfileController);
userRoutes.get("/:id", getUserByIdController);

export default userRoutes;
