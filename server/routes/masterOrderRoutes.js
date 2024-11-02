import express from 'express';
import { userMasterOrderController } from '../controller/masterOrderController.js';
const masterOrderRoutes= express.Router();
masterOrderRoutes.get('/customer/:id',userMasterOrderController)
export default masterOrderRoutes