import express from "express";
import {
  createSingleCategoryController,
  deleteAllCategoriesController,
  deleteSingleCategoryController,
  getAllCategoriesController,
  getSingleCategoryController,
  updateSingleCategoryController,
} from "../controllers/categoriesController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import fileParser from '../middlewares/fileParser.js';
import isAdmin from "../middlewares/isAdmin.js";

const categoriesRouter = express.Router();

categoriesRouter.post("/", isLoggedIn, isAdmin, fileParser.single('file'), createSingleCategoryController);
categoriesRouter.get("/", getAllCategoriesController);
categoriesRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllCategoriesController);
categoriesRouter.get("/:id", getSingleCategoryController);
categoriesRouter.put("/:id", isLoggedIn, isAdmin, updateSingleCategoryController);
categoriesRouter.delete("/:id", isLoggedIn, isAdmin, deleteSingleCategoryController);

export default categoriesRouter;




