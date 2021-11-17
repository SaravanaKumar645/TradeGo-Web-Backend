const products = require("../methods/productActions");
const productMethods = products.productFunctions;
const routes = [
  {
    method: "GET",
    url: "/api/get-all-products",
    handler: productMethods.GetAllProducts,
  },
  {
    method: "POST",
    url: "/api/save-user-prodcut",
    handler: productMethods.SaveUserProducts,
  },
];
module.exports = routes;
