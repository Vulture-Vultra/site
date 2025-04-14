const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

// Avoid OverwriteModelError by checking if the model already exists
module.exports = mongoose.models.User || mongoose.model("User", userSchema);