var mongoose = require("mongoose");
var schema = mongoose.Schema;

var productSchema = new schema(
  {
    user_email: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    productList: [
      {
        p_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        p_name: { type: String, required: true },
        p_price: { type: String, required: true },
        p_stock: { type: String, required: true },
        p_description: { type: String, required: true },
        p_category: { type: String, required: true },
        image_url_1: { type: String, required: true },
        image_url_2: { type: String, required: true },
        image_url_3: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, collection: "products" }
);

module.exports = mongoose.model("Products", productSchema);
