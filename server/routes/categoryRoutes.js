import express from 'express';
import upload from '../config/multerConfig.js';
import { createCategoryController, deleteCategoryController, fetchAllCategoriesController, fetchCategoryByIdController, updateCategoryController } from '../controller/categoryController.js';
const categoryRoutes = express.Router();
categoryRoutes.post('/create', upload.single('image'), createCategoryController);
categoryRoutes.put('/update/:id',updateCategoryController);
categoryRoutes.delete('/delete/:id',deleteCategoryController);
categoryRoutes.get('/single/:id',fetchCategoryByIdController);
categoryRoutes.get('/all',fetchAllCategoriesController);
export default categoryRoutes;

