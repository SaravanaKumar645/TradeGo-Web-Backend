const Products = require("../models/products");

var productFunctions = {
  GetAllProducts: async (req, res) => {
    try {
      const products = await Products.find({});
      console.log(products);
      res.status(200).send({
        success: true,
        msg: "Fetched all menu items !",
        productList: products,
      });
    } catch (err) {
      console.log(err);
      res.status(408).send({
        success: false,
        msg: "Something went wrong !\n" + err,
      });
    }
  },
  SaveUserProducts: async (req, res) => {},
};
module.exports = { productFunctions };
