const orderMethods = require("../methods/orderActions");

const routesOrder = [
  {
    method: "POST",
    url: "/api/get-user-orders/:email",
    handler: orderMethods.orderFunctions.GetUserOrders,
  },
  {
    method: "POST",
    url: "/api/create-orders",
    handler: orderMethods.orderFunctions.CreateOrder,
  },

  {
    method: "POST",
    url: "/api/cancel-orders/:id/:email",
    handler: orderMethods.orderFunctions.CancelOrder,
  },

  {
    method: "POST",
    url: "/api/delete-orders/:id/:email",
    handler: orderMethods.orderFunctions.RemoveOrder,
  },
];
module.exports = routesOrder;
