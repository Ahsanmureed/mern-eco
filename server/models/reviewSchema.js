import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String ,required:true}], 
  masterorderId: { type: mongoose.Schema.Types.ObjectId,  required: true },
  createdAt: { type: Date, default: Date.now },
});
const reviewModel = mongoose.model('reviews',reviewSchema)
export default reviewModel