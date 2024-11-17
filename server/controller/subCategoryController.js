import subcategoryModel from '../models/subCategory.js';
import categoryModel from '../models/categorySchema.js';
import mongoose from 'mongoose';
 const createSubCategoryController = async (req, res) => {
  const image = req.file ? req.file.path:null;
  try {
    const { name, mainCategoryId } = req.body;
    if(!name){
      return res.status(401).json({
        message:'Name is required'
      })
    }
    if(!mainCategoryId){
      return res.status(401).json({
        message:'Main Category is required'
      })
    }
       if(!image ){
        return res.status(401).json({
          message:'Photo is required'
        })
      }
 //validation
 const checkCatName = await subcategoryModel.findOne({name});
 if(checkCatName){
   return res.status(401).json({
     message:'Category already exist'
   })
 }

 
    const mainCategory = await categoryModel.findById(mainCategoryId);
    if (!mainCategory) {
      return res.status(400).json({ message: 'Main category not found' });
    }

    const newSubcategory = new subcategoryModel({ name, mainCategoryId,image });
    await newSubcategory.save();
    res.status(201).json({ message: 'Subcategory created successfully', subcategory: newSubcategory });
  } catch (error) {
    res.status(400).json({ message: 'Error creating subcategory', error: error.message });
  }
};

 const updateSubCategoryController = async (req, res) => {
  const { id } = req.params;
  const { name, mainCategoryId } = req.body;

  try {
    if (mainCategoryId) {
      const mainCategory = await categoryModel.findById(mainCategoryId);
      if (!mainCategory) {
        return res.status(400).json({ message: 'Main category not found' });
      }
    }

    const updatedSubcategory = await subcategoryModel.findByIdAndUpdate(id, { name, mainCategoryId }, { new: true });
    if (!updatedSubcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.status(200).json({ message: 'Subcategory updated successfully', subcategory: updatedSubcategory });
  } catch (error) {
    res.status(400).json({ message: 'Error updating subcategory', error: error.message });
  }
};

 const deleteSubCategoryController = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubcategory = await subcategoryModel.findByIdAndDelete(id);
    if (!deletedSubcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting subcategory', error: error.message });
  }
};
 const fetchAllSubCategoriesController = async (req, res, next) => {
    try {
        const subcategories = await subcategoryModel.find();
        res.json(subcategories);
    } catch (error) {
       
    }
};

 const fetchSubCategoryByIdController = async (req, res, next) => {
    const { id } = req.params;
    try {
        const subcategory = await subcategoryModel.findById(id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.json(subcategory);
    } catch (error) {
       ;
    }
};
const fetchSubCategoriesByMainController = async(req,res)=>{
  const {mainCategoryId} =req.params;
  const id = new mongoose.Types.ObjectId(mainCategoryId);
  console.log(mainCategoryId);
  
  try {
     
      const data = await subcategoryModel.aggregate([
        {$match:{mainCategoryId:id}}
      ])
    return  res.json({data:data});
  } catch (error) {
    
  }
}
export {updateSubCategoryController,deleteSubCategoryController,createSubCategoryController,fetchAllSubCategoriesController,fetchSubCategoryByIdController,fetchSubCategoriesByMainController}