import mongoose from "mongoose";
import productModel from "../models/productSchema.js";
import shopModel from "../models/shopSchema.js";
import { AppError } from "../utils/errorHandler.js";
import logger from '../utils/logger.js'; 
import slugify from "slugify"
const createProductController = async (req, res) => {
  const { name, price, quantity,subCategory ,description} = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    if (!name || !price || !quantity || !subCategory,!description) {
      logger.warn("Product creation attempt with missing fields", { name, price, quantity });
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const shopId = await shopModel.findOne({ userId: req.user._id });

    if (!shopId) {
      logger.warn("Shop not found for user", { userId: req.user._id });
      return res.status(404).json({
        success: false,
        message: "Shop not found, please create a shop",
      });
    }

  
    let slug = slugify(name, { lower: true, strict: true });
    let uniqueSlug = slug;
    let counter = 1;

    
    while (await productModel.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const saveNewProduct = new productModel({
      name,
      slug: uniqueSlug, 
      description,
      price,
      quantity,
      shopId: shopId._id,
      userId: req.user._id,
      images,
      subCategory
    });

    await saveNewProduct.save();

    logger.info("Product created successfully", { productId: saveNewProduct._id });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: saveNewProduct,
    });
  } catch (error) {
    logger.error("Error during product creation", { error });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Pagination
const productPaginationController = async (req, res, next) => {
  try {
    const {
      limit = 10, 
      page = 1, 
      search = "",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedPage = Math.max(parseInt(page), 1);
    const parsedSkip = (parsedPage - 1) * parsedLimit;

    const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const total = await productModel.countDocuments(searchQuery);
    const data = await productModel.find(searchQuery).sort(sortOptions).skip(parsedSkip).limit(parsedLimit);

    const totalPages = Math.ceil(total / parsedLimit);

    logger.info("Fetched products with pagination", { total, limit: parsedLimit, page: parsedPage });

    return res.json({ total, limit: parsedLimit, page: parsedPage, totalPages, data });
  } catch (error) {
    logger.error("Error during product pagination", { error });
    return next(new AppError("Internal server error", 500));
  }
};




// Get single product by ID
const singleProductController = async (req, res, next) => {
  try {
    const { slug } = req.params;
  

    // Validate the slug format if necessary
    if (!slug || typeof slug !== 'string') {
      return next(new AppError("Invalid slug format", 400));
    }

    // Fetch the product by slug
    const data = await productModel.aggregate([{
      $match:{'slug':slug}
    },
  {$lookup:{from:'shops',localField:'shopId',foreignField:'_id',as:'shopDetails'}},
  {$unwind:'$shopDetails'}
])

    if (!data || data.length===0 ) {
      logger.warn("Product not found", { productSlug: slug });
      return next(new AppError("Product not found", 404));
    }

    logger.info("Fetched single product", { productSlug: slug, productId: data._id });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error("Error fetching single product", { error });
    return next(new AppError("Internal server error", 500));
  }
};


const deleteProductController = async (req, res, next) => {
  try {
    const deleteProduct = await productModel.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      logger.warn("Product not found for deletion", { productId: req.params.id });
      return next(new AppError("Product not found", 404));
    }
    logger.info("Product deleted successfully", { productId: req.params.id });
    return res.json({ message: 'Deleted successfully' });
  } catch (error) {
    logger.error("Error deleting product", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const updateProductController = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      logger.warn("Product not found for update", { productId });
      return next(new AppError("Product not found", 404));
    }

    // Get images to remove from request body
    const imagesToRemove = req.body.imagesToRemove ? JSON.parse(req.body.imagesToRemove) : [];
    const newImages = req.files ? req.files.map(file => file.path) : [];

    // Filter out removed images from existing images
    const updatedImages = existingProduct.images.filter(image => 
      !imagesToRemove.includes(image)
    );

    // Combine remaining images with any new images
    const finalImages = [...updatedImages, ...newImages];

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: { ...req.body, images: finalImages } },
      { new: true }
    );

    logger.info("Product updated successfully", { productId });
    return res.json({ data: updatedProduct });
  } catch (error) {
    logger.error("Error updating product", { error });
    return next(new AppError("Internal server error", 500));
  }
};




const allProductController = async (req, res, next) => {
  try {
    const data = await productModel.find({});
    logger.info("Fetched all products");
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching all products", { error });
    return next(new AppError("Internal server error", 500));
  }
};
const userProductController = async(req,res,next)=>{
 
  
 try {
  const products = await productModel.find({userId:req.params.id})
  res.json({data:products})

 } catch (error) {
  logger.error("Error fetching user products", { error });
  return next(new AppError("Internal server error", 500));
 }
}
const fetchProductsBySubCategoryController = async(req,res)=>{
  const {subCategoryId}= req.params;
  const id = new mongoose.Types.ObjectId(subCategoryId)
  try {
    const data= await productModel.aggregate([{
      $match:{subCategory:id}
    }])
    res.json({data})
  } catch (error) {
    
  }
}
export { 
  createProductController, 
  productPaginationController, 
  singleProductController, 
  deleteProductController, 
  updateProductController, 
  allProductController ,
  userProductController,
  fetchProductsBySubCategoryController
};
