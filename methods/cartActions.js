const Cart = require("../models/cart");

var cartFunctions = {
  AddToCart: async (req, res) => {
    const itemDetails = req.body.item;
    try {
      const existingCart = await Cart.findOne({
        email: itemDetails.email,
        item_id: itemDetails._id,
      });
      if (existingCart) {
        return res.status(202).send({
          success: false,
          msg: "Item Already added to cart",
        });
      } else {
        const newCartItem = new Cart({
          email: itemDetails.email,
          item_name: itemDetails.item_name,
          item_id: itemDetails._id,
          item_details: itemDetails,
        });
        try {
          const cartItem = await newCartItem.save();
          console.log(cartItem);
          res.status(200).send({
            success: true,
            msg: "Item addded to Cart !",
            addedItem: cartItem,
          });
        } catch (err) {
          console.log(err);
          res.status(408).send({
            success: false,
            msg: "Something went wrong !\n" + err,
          });
        }
      }
    } catch (err) {
      return res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  RemoveFromCart: async (req, res) => {
    try {
      const cart = await Cart.findOneAndDelete({
        _id: req.body.id,
        email: req.body.email,
      });
      console.log(cart);
      res.status(200).send({
        success: true,
        msg: "Item removed from Cart !",
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  FetchUserCart: async (req, res) => {
    try {
      console.log("hello        " + req.params.email);
      const carts = await Cart.find({ email: req.params.email });
      console.log(carts);
      res.status(200).send({
        success: true,
        msg: "Fetched cart items successfully !",
        cartDetails: carts,
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
};
module.exports = { cartFunctions };
