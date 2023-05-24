import Order from "../model/Order.js";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import Product from "../model/Product.js";
import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Coupon from "../model/Coupon.js";

// @desc    create orders
// @route   POST /api/v1/orders
// @access  private
//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);
export const createOrderController = asyncHandler(async (req, res) => {
  // get coupon
  const { coupon } = req?.query;
  if (!coupon) {
    throw new Error("Coupon does not exist");
  }

  const couponFound = await Coupon.findOne({
    code: coupon?.toUpperCase(),
  });

  if (!couponFound) {
    throw new Error("Coupon does not exist");
  }

  if (couponFound.isExpired) {
    throw new Error("Coupon has expired");
  }

  // get discount
  const discount = couponFound?.discount / 100; // I think no need for the chaining operator, cuz we already checked its existence

  //Get the payload(customer, orderItems, shippingAddress, totalPrice)
  const { orderItems, shippingAddress, totalPrice } = req.body;
  //Find the user
  const user = await User.findById(req.userAuthId);
  //Check if user has shipping address
  if (!user?.hasShippingAddress) {
    throw new Error("Please provide shipping address");
  }
  //Check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error("No order/items to be purchased!");
  }
  //Place/create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice
  });
  console.log(order);

  //Update the product quantity
  const products = await Product.find({ _id: { $in: orderItems } });

  await Promise.all(
    orderItems.map(async (order) => {
      const product = products.find((product) => {
        return product?._id.toString() === order?._id?.toString();
      });

      if (!product) {
        throw new Error("Product not found");
      } else {
        product.totalSold += order.qty;
        await product.save();
      }
    })
  );

  //push order id into user
  user.orders.push(order?._id);
  await user.save();

  //make payment (stripe)
  //convert order items to have stripe structure
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          description: item.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id), // now we have access to this metadata inside our webhook
    },
    mode: "payment", //not subscription
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  // Update order with paymentIntentId
  order.paymentIntentId = session.payment_intent;
  await order.save();

  res.send({ url: session.url });
});

// @desc    Fetch all orders
// @route   GET /api/v1/orders
// @access  private/admin
export const getAllOrdersController = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email");

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Fetch a single order
// @route   GET /api/v1/orders/:id
// @access  private/admin
export const getOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate(
    "user",
    "fullname email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    update order to delivered
// @route   PUT /api/v1/orders/update/:id
// @access  private/admin
export const updateOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = req.body.status;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: "Order updated",
    data: updatedOrder,
  });
});

// @desc    Delete all orders
// @route   DELETE /api/v1/orders/deleteall
// @access  private/admin
export const deleteAllOrdersController = asyncHandler(async (req, res) => {
  await Order.deleteMany();

  res.json({
    success: true,
    message: "All orders have been deleted",
  });
});


// @desc  Get sales sum of orders
// @route GET /api/v1/orders/sales/sum
// @access  private/admin
export const getOrderStatsController = asyncHandler(async(req,res)=>{
  // get order stats
  const orders = await Order.aggregate([
    {
      "$group":{
        _id: null,
        minimumSale:{
          $min: '$totalPrice'
        },
        totalSales:{
          $sum: "$totalPrice"
        },
        maximumSale:{
          $max: '$totalPrice'
        },
        averageSale:{
          $avg: '$totalPrice'
        }
      }
    }
  ])
  // get the date
  const date = new Date()
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const saleToday = await Order.aggregate([
    {
      $match:{
        createdAt:{
          $gte: today,
        }
      }
    },
    {
      $group:{
        _id: null,
        totalSales:{
          $sum: '$totalPrice'
        }
      }
    }
  ])
  // send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday
  })
})