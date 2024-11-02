import express from 'express';
import { allOrderDetailsController, createOrderController, userOrderController,singleOrderDetailController, updateOrderStatusController, fetchOrderWithShopId } from '../controller/orderController.js';
import {verifyToken} from '../middlewares/verifyToken.js';
const orderRoute= express.Router();
orderRoute.post("/create/order",verifyToken,createOrderController);
orderRoute.get('/order/get/:id',singleOrderDetailController)
orderRoute.get('/orders',allOrderDetailsController)
orderRoute.get('/customer/order/:id',userOrderController)
orderRoute.put('/order/update/:id',updateOrderStatusController)
orderRoute.get('/order/user',verifyToken,fetchOrderWithShopId)
export default orderRoute;