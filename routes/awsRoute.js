import express from "express";
import {
  awsUpload, awsGetImage, awsDeleteImage, awsUpdateImage, awsListImages
} from "../controllers/awsController.js";

const awsRouter = express.Router();

awsRouter.get('/', awsListImages);
awsRouter.post("/", awsUpload);
awsRouter.get("/:id", awsGetImage);
awsRouter.put("/:id", awsUpdateImage);
awsRouter.delete("/delete/:id", awsDeleteImage);


export default awsRouter;
