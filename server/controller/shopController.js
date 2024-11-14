import shopModel from "../models/shopSchema.js";
import { AppError } from "../utils/errorHandler.js";
import logger from '../utils/logger.js'; // Import your logger

const createShopController = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      logger.warn("Shop creation attempt with missing name", { userId: req.userId });
      return res.status(400).json({
        success: false,
        message: 'Please enter the name'
      });
    }
    const shop = await shopModel.findOne({ userId: req.userId });

    if (shop) {
      logger.warn("User already has a shop", { userId: req.userId });
      return res.status(409).json({
        success: false,
        message: 'User already has one shop'
      });
    }
    
    const newShop = new shopModel({ name, userId: req.userId });
    await newShop.save();

    logger.info("Shop created successfully", { shopId: newShop._id, userId: req.userId });

    return res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: newShop
    });
  } catch (error) {
    logger.error("Error during shop creation", { error });
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later"
    });
  }
};

const shopPaginationController = async (req, res, next) => {
  try {
    const {
      limit,
      skip,
      search = "",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const parsedLimit = limit !== undefined ? Math.min(parseInt(limit), 100) : 10;
    const parsedSkip = skip !== undefined ? parseInt(skip) : 0;

    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const total = await shopModel.countDocuments(searchQuery);
    const data = await shopModel
      .find(searchQuery)
      .sort(sortOptions)
      .skip(parsedSkip)
      .limit(parsedLimit);

    logger.info("Fetched shops with pagination", { total, limit: parsedLimit, skip: parsedSkip });

    return res.json({ total, limit: parsedLimit, skip: parsedSkip, data });
  } catch (error) {
    logger.error("Error during shop pagination", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

// Get single shop by ID
const singleShopController = async (req, res, next) => {
  try {
    const data = await shopModel.findById(req.params.id);
    if (!data) {
      logger.warn("Shop not found", { shopId: req.params.id });
      return next(new AppError("Shop not found", 404));
    }
    logger.info("Fetched single shop", { shopId: req.params.id });
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching single shop", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const deleteShopController = async (req, res, next) => {
  try {
    const deleteShop = await shopModel.findByIdAndDelete(req.params.id);
    if (!deleteShop) {
      logger.warn("Shop not found for deletion", { shopId: req.params.id });
      return next(new AppError("Shop not found", 404));
    }
    logger.info("Shop deleted successfully", { shopId: req.params.id });
    return res.json({ message: 'deleted successfully' });
  } catch (error) {
    logger.error("Error deleting shop", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const updateShopController = async (req, res, next) => {
  try {
    const updateShop = await shopModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updateShop) {
      logger.warn("Shop not found for update", { shopId: req.params.id });
      return next(new AppError("Shop not found", 404));
    }
    logger.info("Shop updated successfully", { shopId: req.params.id });
    return res.json({ data: updateShop });
  } catch (error) {
    logger.error("Error updating shop", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const allShopController = async (req, res, next) => {
  try {
    const data = await shopModel.find({});
    logger.info("Fetched all shops");
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching all shops", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};
const userShopController = async(req,res,next)=>{
  try {
        const userShop = await shopModel.find({userId:req.params.id})
       
        res.json({data:userShop})
        
  } catch (error) {
    logger.error("Error fetching user shop", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
}
export {
  createShopController,
  singleShopController,
  allShopController,
  updateShopController,
  deleteShopController,
  shopPaginationController,
  userShopController
};
