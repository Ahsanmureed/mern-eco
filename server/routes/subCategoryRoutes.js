import express from 'express';
import { createSubCategoryController, deleteSubCategoryController, fetchAllSubCategoriesController, fetchSubCategoryByIdController, updateSubCategoryController } from '../controller/subCategoryController.js';
const subCategoryRoutes = express.Router();
subCategoryRoutes.post('/create',createSubCategoryController);
subCategoryRoutes.put('/update/:id',updateSubCategoryController);
subCategoryRoutes.delete('/delete/:id',deleteSubCategoryController);
subCategoryRoutes.get('/single/:id',fetchSubCategoryByIdController);
subCategoryRoutes.get('/all',fetchAllSubCategoriesController);
export default subCategoryRoutes;