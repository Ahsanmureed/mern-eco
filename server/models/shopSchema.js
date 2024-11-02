import mongoose from "mongoose";
const shopSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  userId:{
    type:mongoose.Schema.ObjectId,
    required:true
  }
})
const shopModel = mongoose.model('shop',shopSchema);
export default shopModel;