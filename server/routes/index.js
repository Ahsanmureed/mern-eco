import express from 'express'
const router = express.Router();
import productRouter from './productRoutes.js'
import userRouter from './userRoutes.js';
import shopRouter from './shopRoutes.js';
import customerRoute from './customerRoutes.js'
import orderRoute from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import masterOrderRoutes from './masterOrderRoutes.js';
import messageRoutes from './messageRoutes.js';
import categoryRoutes from './categoryRoutes.js'
import subCategoryRoutes from './subCategoryRoutes.js';
router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/shop', shopRouter);
router.use('/customer',customerRoute)
router.use('/order',orderRoute)
router.use('/review',reviewRoutes)
router.use('/master',masterOrderRoutes)
router.use('/message',messageRoutes)
router.use('/category',categoryRoutes)
router.use('/subcategory',subCategoryRoutes)
export default router;


