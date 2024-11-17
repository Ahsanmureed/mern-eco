import express from 'express';
import upload from '../config/multerConfig.js';
import { createSubCategoryController, deleteSubCategoryController, fetchAllSubCategoriesController, fetchSubCategoriesByMainController, fetchSubCategoryByIdController, updateSubCategoryController } from '../controller/subCategoryController.js';
const subCategoryRoutes = express.Router();
subCategoryRoutes.post('/create', upload.single('image'),createSubCategoryController);
subCategoryRoutes.put('/update/:id',updateSubCategoryController);
subCategoryRoutes.delete('/delete/:id',deleteSubCategoryController);
subCategoryRoutes.get('/single/:id',fetchSubCategoryByIdController);
subCategoryRoutes.get('/all',fetchAllSubCategoriesController);
subCategoryRoutes.get('/by/:mainCategoryId',fetchSubCategoriesByMainController)
export default subCategoryRoutes;