import categoryModel from "../models/categorySchema.js";

 const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new categoryModel({ name });
    await newCategory.save();
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

 const updateCategoryController = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await categoryModel.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

 const deleteCategoryController = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category', error: error.message });
  }
};

 const fetchAllCategoriesController = async (req, res, next) => {
    try {
        const categories = await categoryModel.find();
        res.json(categories);
    } catch (error) {
      
    }
};

 const fetchCategoryByIdController = async (req, res, next) => {
    const { id } = req.params;
    try {
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        
    }
};
export {deleteCategoryController,updateCategoryController,createCategoryController,fetchAllCategoriesController,fetchCategoryByIdController}