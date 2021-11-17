const Orders = require("../models/orders");

var orderFunctions = {
  CreateOrder: async (req, res) => {
    const orderDetails = req.body.orderedItem;
    var newOrder = new Orders({
      email: orderDetails.email,
      item_name: orderDetails.item_name,
      item_id: orderDetails._id,
      quantity: req.body.quantity,
      item_details: orderDetails,
    });
    try {
      const order = await newOrder.save();
      console.log(order);
      res.status(200).send({
        success: true,
        msg: "Order Placed Successfully !",
        orderDetails: order,
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  GetUserOrders: async (req, res) => {
    try {
      const orders = await Orders.find({ email: req.params.email });
      console.log(orders);
      res.status(200).send({
        success: true,
        msg: "Fetched your orders successfully !",
        orderDetails: orders,
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  CancelOrder: async (req, res) => {
    try {
      const order = await Orders.findOneAndUpdate(
        {
          _id: req.params.id,
          email: req.params.email,
        },
        { delivery_status: "cancelled" },
        { new: true }
      );

      console.log(order);
      res.status(200).send({
        success: true,
        msg: "Your Order has been cancelled .",
        orderDetails: order,
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  RemoveOrder: async (req, res) => {
    try {
      const order = await Orders.findOneAndDelete({
        _id: req.params.id,
        email: req.params.email,
      });
      console.log(order);
      res.status(200).send({
        success: true,
        msg: "Order Removed from the List !",
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
module.exports = { orderFunctions };
