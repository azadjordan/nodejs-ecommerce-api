import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createSingleProductController,
  getAllProductsController,
  getSingleProductController,
  updateSingleProductController,
  deleteSingleProductController,
  deleteAllProductsController,
} from "../controllers/productsController.js";
import fileParser from '../middlewares/fileParser.js';
import s3Uploader from '../middlewares/s3Uloader.js';
import isAdmin from "../middlewares/isAdmin.js";

const productsRouter = express.Router();

productsRouter.post("/", isLoggedIn,isAdmin, fileParser.array('files'), createSingleProductController, s3Uploader);
productsRouter.get("/", isLoggedIn,  getAllProductsController);
productsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllProductsController);
productsRouter.get("/:id", getSingleProductController);
productsRouter.put("/:id", isLoggedIn, isAdmin, updateSingleProductController);
productsRouter.delete("/delete/:id", isLoggedIn, isAdmin, deleteSingleProductController);

export default productsRouter;
