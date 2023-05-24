import express from "express"
import { createCouponController, deleteAllCouponsController, deleteSingleCouponController, getAllCouponsController, getSingleCouponController, updateSingleCouponController } from "../controllers/couponsController.js"
import {isLoggedIn} from "../middlewares/isLoggedIn.js"
import isAdmin from "../middlewares/isAdmin.js"
const couponsRouter = express.Router()

couponsRouter.post("/", isLoggedIn, isAdmin, createCouponController)
couponsRouter.get("/", isLoggedIn, getAllCouponsController )
couponsRouter.delete("/deleteall", isLoggedIn, isAdmin, deleteAllCouponsController )
couponsRouter.put("/update/:id", isLoggedIn, isAdmin, updateSingleCouponController )
couponsRouter.delete("/delete/:id", isLoggedIn, isAdmin, deleteSingleCouponController )
couponsRouter.get("/:id", isLoggedIn, getSingleCouponController )

export default couponsRouter