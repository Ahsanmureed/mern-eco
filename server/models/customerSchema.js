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
  tokenExpiry:Date
});
const customerModel = mongoose.model('customers',customerSchema)
export default customerModel;