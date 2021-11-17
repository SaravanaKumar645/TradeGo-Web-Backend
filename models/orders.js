var mongoose = require("mongoose");
var schema = mongoose.Schema;

var orderSchema = new schema(
  {
    user_email: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderList: [
      {
        p_userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        p_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        p_quantity: { type: Number, required: true },
        p_name: { type: String, required: true },
        p_price: { type: String, required: true },
        p_stock: { type: String, required: true },
        p_description: { type: String, required: true },
        p_category: { type: String, required: true },
        p_status: {
          type: String,
          enum: ["pending", "cancelled", "delivered"],
          default: "pending",
        },
        image_url_1: { type: String, required: true },
        image_url_2: { type: String, required: true },
        image_url_3: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, collection: "orders" }
);

module.exports = mongoose.model("Order", orderSchema);
