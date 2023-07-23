import express from 'express';
import stripe from '../config/stripe.js';
import Order from "../model/Order.js"; // Make sure to use the correct path
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, process.env.ENDPOINT_SECRET);
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

export default router;
