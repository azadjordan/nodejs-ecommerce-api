import dotenv from "dotenv";
import cors from 'cors'
dotenv.config();
import express from "express";
import dbConnect from "../config/dbConnect.js";
import userRoutes from "../routes/usersRoute.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import productsRouter from "../routes/productsRoute.js";
import categoriesRouter from "../routes/categoriesRoute.js";
import brandsRouter from "../routes/brandsRoute.js";
import colorsRouter from "../routes/colorsRoute.js";
import reviewsRouter from "../routes/reviewsRouter.js";
import orderRouter from "../routes/ordersRouter.js";
import couponsRouter from "../routes/couponsRouter.js";
import imagesRouter from "../routes/imagesRouter.js";
import stripeWebhook from '../webhooks/stripeWebhook.js';


// Connect to Database
dbConnect();
const app = express();

//cors
app.use(cors())

//Stripe Webhook
app.use('/webhook', stripeWebhook);

// pass incoming data
app.use(express.json());
app.use((req, res, next) => {
  console.log(`PATH: [${req.path}]      METHOD: [${req.method}]`);
  next();
});
//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/brands", brandsRouter);
app.use("/api/v1/colors", colorsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/coupons", couponsRouter);
app.use("/api/v1/images", imagesRouter);

// visit the documentation first
app.get("/", (req, res) => {
  res.redirect("https://documenter.getpostman.com/view/23089695/2s93m6124N#intro");
});



// err middleware
app.use(notFound);
app.use(globalErrHandler);

export default app;
