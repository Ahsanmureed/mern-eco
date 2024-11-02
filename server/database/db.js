import mongoose from "mongoose";
const db = "mongodb://localhost:27017/testDB";
const connection = () => {
  try {
    const connect = mongoose.connect(db);
    console.log("db connected"); 
  } catch (error) {
    console.log(error);
  }
};
export default connection;