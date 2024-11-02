import express from 'express'
import { allShopController, createShopController, deleteShopController, shopPaginationController, singleShopController, updateShopController, userShopController } from '../controller/shopController.js';
import {verifyToken} from '../middlewares/verifyToken.js';
const shopRouter = express.Router();
shopRouter.post('/create/shop',verifyToken,createShopController);
shopRouter.get('/shop/:id',singleShopController)
shopRouter.get('/user/:id',userShopController)
shopRouter.delete('/shop/:id',deleteShopController)
shopRouter.put('/shop/:id',updateShopController)
shopRouter.get('/shops',allShopController)
shopRouter.get('/shop/pagination',shopPaginationController);
export default shopRouter;