import express from 'express'
import { 
    createOrderController,
    deleteAllOrdersController,
    getAllOrdersController, 
    getOrderController, 
    getOrderStatsController, 
    updateOrderController 
} from '../controllers/orderController.js'
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import isAdmin from '../middlewares/isAdmin.js';


const orderRouter = express.Router()

orderRouter.post('/', isLoggedIn, isAdmin, createOrderController )
orderRouter.get('/', isLoggedIn, getAllOrdersController )
orderRouter.delete('/deleteall', isLoggedIn, isAdmin, deleteAllOrdersController )
orderRouter.get('/:id', isLoggedIn, getOrderController )
orderRouter.put('/update/:id', isLoggedIn, isAdmin, updateOrderController )
orderRouter.get("/sales/stats", isLoggedIn, getOrderStatsController);

export default orderRouter