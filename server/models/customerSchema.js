import mongoose from "mongoose";
const customerSchema = new mongoose.Schema({
  username: String,
  email: String,
  address: {
      street: String,
      city: String,
      state: String,
      zip: String
  },

  password:String,
  forgotPassword:String,
  tokenExpiry:Date,
  address: {
    street: { type: String }, 
    city: { type: String },
    state: { type: String },
    country: { type: String }, 
    zip: { type: String }, 
    phone_number: {type: String },
  },
});
const customerModel = mongoose.model('customers',customerSchema)
export default customerModel;