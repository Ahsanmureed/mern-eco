
import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
  customer_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  products:[{
    product_id:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
    },
    product_quantity:{
      type:Number,
      required:true,
      min:1
    }
  }],
  total_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  shop_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
  },
  shipment_address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
  }, 
  billing_address: {
   
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
      phone_number: {
        type: String,
        required: true,
      },
    
  },
  billing_type: {
    type: String,
    enum: ['COD', 'CardPayment'], 
    required: true,
  },
  status:{
    type:String,
    enum: ["received", "in_progress" , "shipped", "delivered","rejected"], 
    default:'received'
  },
  master_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterOrder', 
  },
},{timestamps:true});
const orderModel = mongoose.model('orders',orderSchema)
export default orderModel;