import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  images: [{ type: String,required:true }],
  shopId: {
    type: mongoose.Schema.ObjectId,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId}],
  subCategory: { type: mongoose.Schema.Types.ObjectId}
});
const productModel = mongoose.model("products", productSchema);
export default productModel;
