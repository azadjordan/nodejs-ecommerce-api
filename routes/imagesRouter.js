import express from "express";
import {
getAllImagesController,
deleteAllImagesController
} from "../controllers/imagesController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";


const imagesRouter = express.Router();

imagesRouter.get("/", isLoggedIn, getAllImagesController);
imagesRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllImagesController);


export default imagesRouter;
