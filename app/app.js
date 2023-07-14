import dotenv from "dotenv";
import cors from 'cors'
dotenv.config();
import Stripe from "stripe";
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
import Order from "../model/Order.js";
import couponsRouter from "../routes/couponsRouter.js";
import imagesRouter from "../routes/imagesRouter.js";

// Connect to Database
dbConnect();
const app = express();

//cors
app.use(cors())

//Stripe Webhook
//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_eeb57eaaaf94a0efb80b5a42d72a690d00aee16c34adef6e0b0ba657bd0a559d";

  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (request, response) => {
      const sig = request.headers["stripe-signature"];
  
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
  
      if (event.type === "checkout.session.completed") {
        // Update order
        const session = event.data.object;
        const { orderId } = session.metadata;
        const paymentStatus = session.payment_status;
        const paymentMethod = session.payment_method_types[0];
        const totalAmount = session.amount_total;
        const currency = session.currency;
  
        try {
          // Find the order and update its details
          const order = await Order.findByIdAndUpdate(
            JSON.parse(orderId),
            {
              totalPrice: totalAmount / 100,
              currency,
              paymentMethod,
              paymentStatus,
            },
            { new: true }
          );
  
          if (!order) {
            console.log(`Order not found for orderId: ${orderId}`);
          } else {
            console.log(`Order ${order._id} has been updated.`);
          }
        } catch (error) {
          console.log(`Error updating order: ${error.message}`);
        }
      }
  
      // Return a 200 response to acknowledge receipt of the event
      response.send();
    }
  );
  

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
