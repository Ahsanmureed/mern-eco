import express from 'express'
import { allreviewController, createReviewController, reviewByProductIdController, reviewDeleteController, reviewUpdateController } from '../controller/reviewController.js';
import upload from '../config/multerConfig.js';
import {verifyToken} from '../middlewares/verifyToken.js';
const reviewRoutes = express.Router();
reviewRoutes.post('/create',verifyToken,upload.array('images', 5), createReviewController)
reviewRoutes.get('/product/:slug',reviewByProductIdController)
reviewRoutes.put('/product/:id',verifyToken,reviewUpdateController)
reviewRoutes.delete('/product/:id',verifyToken,reviewDeleteController)
reviewRoutes.get('/all',allreviewController)
export default reviewRoutes