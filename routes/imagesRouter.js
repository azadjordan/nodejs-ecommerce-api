import express from "express";
import {
getAllImagesController,
deleteAllImagesController,
deleteSingleImageController
} from "../controllers/imagesController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from "../middlewares/isAdmin.js";


const imagesRouter = express.Router();

imagesRouter.get("/", isLoggedIn, getAllImagesController);
imagesRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllImagesController);
imagesRouter.delete("/image/:imageId/product/:productId", isLoggedIn , deleteSingleImageController);


export default imagesRouter;
