import express from 'express'
import { allProductController, createProductController, deleteProductController, productPaginationController, singleProductController, updateProductController, userProductController } from '../controller/productController.js';
import upload from '../config/multerConfig.js';
import {verifyToken} from '../middlewares/verifyToken.js';

const prodcustRouter = express.Router();
prodcustRouter.post('/create/product',verifyToken, upload.array('images', 5),createProductController)
prodcustRouter.get('/:slug',singleProductController)
prodcustRouter.get('/user/:id',userProductController)
prodcustRouter.delete('/:id',deleteProductController)
prodcustRouter.put('/:id',upload.array('images', 5),updateProductController)
prodcustRouter.get('/products',allProductController)
prodcustRouter.get('/product/pagination',productPaginationController)
export default prodcustRouter