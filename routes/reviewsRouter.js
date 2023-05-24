import express from "express";
import {
  createSingleReviewController, deleteAllReviewsController
} from "../controllers/reviewsController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";


const reviewsRouter = express.Router();

reviewsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllReviewsController);
reviewsRouter.post("/:productID", isLoggedIn, createSingleReviewController);

export default reviewsRouter;
