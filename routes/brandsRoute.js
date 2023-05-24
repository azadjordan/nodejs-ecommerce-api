import express from "express";
import {
  createSingleBrandController,
  deleteAllBrandsController,
  deleteSingleBrandController,
  getAllBrandsController,
  getSingleBrandController,
  updateSingleBrandController,
} from "../controllers/brandsController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";

const brandsRouter = express.Router();

brandsRouter.post("/", isLoggedIn, isAdmin, createSingleBrandController);
brandsRouter.get("/", getAllBrandsController);
brandsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllBrandsController);
brandsRouter.get("/:id", getSingleBrandController);
brandsRouter.put("/:id", isLoggedIn, isAdmin, updateSingleBrandController);
brandsRouter.delete("/:id", isLoggedIn, isAdmin, deleteSingleBrandController);

export default brandsRouter;
