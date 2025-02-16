
import mongoose from "mongoose";


const masterOrder = new mongoose.Schema({
  customer_id:{
    type:mongoose.Schema.Types.ObjectId,
    // required:true
  },
  order_references: [{
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
  }],
  total_amount: {
    type: Number,
    // required: true,
    min: 0,
  },
  address: {
    street: {
      type: String,
      // required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    state: {
      type: String,
      // required: true,
    },
    zip: {
      type: String,
      // required: true,
    },
    country:{
      type: String,
      // required: true,
    },
    phone_number: {
      type: String,
      // required: true,
    },
  }, 
  billing_type: {
    type: String,
    enum: ['COD', 'CardPayment'], 
    // required: true,
  },
  status:{
    type:String,
    enum: ["received", "in_progress" ,"canceled", "shipped", "delivered","rejected",'partially_delivered'], 
    default:'in_progress'
  }
},{timestamps:true});
const masterOrderModel = mongoose.model('masterOrders',masterOrder)
export default masterOrderModel;