const mongoose = require("mongoose");
let categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    }
  ],
});

let Category = mongoose.model('Category',categorySchema);
module.exports = Category;  