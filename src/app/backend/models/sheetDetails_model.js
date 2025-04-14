const mongoose = require("mongoose");

const sheetDetailsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  sheetName: {
    type: String,
    required: true,
  },
  jsonData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

// Check if the model already exists before defining it
module.exports = mongoose.models.SheetDetails || mongoose.model("SheetDetails", sheetDetailsSchema);