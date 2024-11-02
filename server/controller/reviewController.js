import mongoose from "mongoose";
import masterOrderModel from "../models/masterOrderSchema.js";
import productModel from "../models/productSchema.js";
import reviewModel from '../models/reviewSchema.js';
import logger from '../utils/logger.js'; 

const createReviewController = async (req, res) => {
  const { productId, rating, comment, masterorderId } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      logger.warn("Product not found", { productId });
      return res.status(404).json({ message: 'Product not found.' });
    }

    const masterOrder = await masterOrderModel.findById(masterorderId);
    if (!masterOrder || masterOrder.status !== 'delivered') {
      logger.warn("Order not delivered", { masterorderId, status: masterOrder?.status });
      return res.status(401).json({ message: 'Order is not delivered.' });
    }

    const existingReview = await reviewModel.findOne({ product: productId, customer: req.userId,masterorderId });
    if (existingReview) {
      logger.warn("User has already reviewed this product", { productId, userId: req.userId });
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = new reviewModel({ product: productId, customer: req.userId, rating, comment, images,masterorderId });
    await review.save();

    product.reviews.push(review._id);
    await product.save();

    logger.info("Review created successfully", { reviewId: review._id, productId });
    res.status(201).json(review);
  } catch (error) {
    logger.error("Error while creating review", { error });
    res.status(500).json({ message: 'An error occurred while creating the review.' });
  }
}

const reviewByProductIdController = async (req, res) => {
  const slug = req.params.slug;
  console.log(slug);
  
 
    const reviews = await productModel.aggregate([
      { $match: { 'slug': slug } },
      {
          $lookup: {
              from: 'reviews',
              localField: 'reviews',
              foreignField: '_id',
              as: 'reviews'
          }
      },
      {
          $unwind: {
              path: '$reviews',
              preserveNullAndEmptyArrays: true // Keep the product if it has no reviews
          }
      },
      {
          $lookup: {
              from: 'customers',
              localField: 'reviews.customer',
              foreignField: '_id',
              as: 'customer'
          }
      },
      {
          $unwind: {
              path: '$customer',
              preserveNullAndEmptyArrays: true // Keep the review if it has no customer data
          }
      },
      {
          $group: {
              _id: '$_id', // Group by product ID
              name: { $first: '$name' },
              price: { $first: '$price' },
              quantity: { $first: '$quantity' },
              images: { $first: '$images' },
              reviews: {
                  $push: {
                      $cond: {
                          if: {
                              $and: [
                                  { $ne: ['$customer', null] },
                                  { $gt: [{ $type: '$customer' }, 'missing'] } 
                              ]
                          },
                          then: {
                              _id: '$reviews._id',
                              rating: '$reviews.rating',
                              comment: '$reviews.comment',
                              images: '$reviews.images',
                              masterorderId: '$reviews.masterorderId',
                              createdAt: '$reviews.createdAt',
                              customer: {
                                  _id: '$customer._id',
                                  username: '$customer.username',
                                  email: '$customer.email'
                              }
                          },
                          else: null
                      }
                  }
              }
          }
      },
      {
          $project: {
              reviews: { $filter: { input: '$reviews', as: 'review', cond: { $ne: ['$$review', null] } } } 
          }
      }
  ]);
  
  
  
    
    logger.info("Fetched reviews for product", { slug });
    return res.json({ data: reviews });
 
}

const reviewUpdateController = async (req, res) => {
  try {
    const updateReview = await reviewModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updateReview) {
      logger.warn("Review not found for update", { reviewId: req.params.id });
      return res.status(404).json({ message: 'Review not found.' });
    }
    logger.info("Review updated successfully", { reviewId: req.params.id });
    return res.json({ data: updateReview });
  } catch (error) {
    logger.error("Error while updating review", { error });
    res.status(500).json({ message: 'An error occurred while updating the review.' });
  }
}

const reviewDeleteController = async (req, res) => {
  try {
    const deleteReview = await reviewModel.findByIdAndDelete(req.params.id);
    if (!deleteReview) {
      logger.warn("Review not found for deletion", { reviewId: req.params.id });
      return res.status(404).json({ message: 'Review not found.' });
    }
    logger.info("Review deleted successfully", { reviewId: req.params.id });
    return res.json({ message: 'Successfully deleted the review.' });
  } catch (error) {
    logger.error("Error while deleting review", { error });
    res.status(500).json({ message: 'An error occurred while deleting the review.' });
  }
}
const allreviewController =async (req,res)=>{
 try {
  const reviews = await reviewModel.find({});
 res.json({data:reviews})
 logger.info("Review fetched successfully",);
 } catch (error) {
  logger.error("Error while fetching review", { error });
    res.status(500).json({ message: 'An error occurred while fetching the reviews.' });
 }
}
export { createReviewController, reviewByProductIdController, reviewDeleteController, reviewUpdateController,allreviewController };


