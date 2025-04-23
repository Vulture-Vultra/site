const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDb = async () => {
  try {
    //console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    // process.exit(1);
  }
};
module.exports = connectDb;