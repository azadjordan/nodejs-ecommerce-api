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
import isAdmin from "../middlewares/isAdmin.js";

const productsRouter = express.Router();

productsRouter.post("/", isLoggedIn, isAdmin, fileParser.array('files'), createSingleProductController);
productsRouter.get("/", getAllProductsController);
productsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllProductsController);
productsRouter.get("/:id", getSingleProductController);
productsRouter.put("/:id/update", isLoggedIn, isAdmin, fileParser.array('files'), updateSingleProductController);
productsRouter.delete("/delete/:id", isLoggedIn, isAdmin, deleteSingleProductController);

export default productsRouter;
