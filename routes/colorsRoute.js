import express from "express";
import {
  createSingleColorController,
  deleteAllColorsController,
  deleteSingleColorController,
  getAllColorsController,
  getSingleColorController,
  updateSingleColorController,
} from "../controllers/colorsController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";

const colorsRouter = express.Router();

colorsRouter.post("/", isLoggedIn, isAdmin, createSingleColorController);
colorsRouter.get("/", getAllColorsController);
colorsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllColorsController);
colorsRouter.get("/:id", getSingleColorController);
colorsRouter.put("/:id", isLoggedIn, isAdmin, updateSingleColorController);
colorsRouter.delete("/:id", isLoggedIn, isAdmin, deleteSingleColorController);

export default colorsRouter;
