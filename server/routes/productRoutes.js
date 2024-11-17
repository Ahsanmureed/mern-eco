import express from 'express'
import { allProductController, createProductController, deleteProductController, fetchProductsBySubCategoryController, productPaginationController, singleProductController, updateProductController, userProductController } from '../controller/productController.js';
import upload from '../config/multerConfig.js';
import {verifyToken} from '../middlewares/verifyToken.js';

const productRouter = express.Router();
productRouter.post('/create/product',verifyToken, upload.array('images', 5),createProductController)
productRouter.get('/:slug',singleProductController)
productRouter.get('/user/:id',userProductController)
productRouter.delete('/:id',deleteProductController)
productRouter.put('/:id',upload.array('images', 5),updateProductController)
productRouter.get('/products',allProductController)
productRouter.get('/product/pagination',productPaginationController)
productRouter.get('/products/:subCategoryId',fetchProductsBySubCategoryController)
export default productRouter