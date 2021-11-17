const fastify = require("fastify")();
const connectMongo = require("./config/dbConfig");
const routes = require("./routes/authRoutes");
const routesOrder = require("./routes/orderRoutes");
const routesCart = require("./routes/cartRoutes");
// /HEROKU LOGGING :heroku logs -a restaurant-web-server --tail
//fastify plugins
fastify.register(require("fastify-cookie"));
fastify.register(require("fastify-cors"), {
  origin: "*",
});
fastify.register(require("fastify-formbody"));
fastify.register(require("fastify-express"));

//connect MongoDB
console.log("----------   From Server !   -----------");
connectMongo.connectDB();

//Configure routes for fastify
const routePlugin = async () => {
  routes.forEach(async (route) => {
    await fastify.route(route);
  });
  routesOrder.forEach(async (route) => {
    await fastify.route(route);
  });
  routesCart.forEach(async (route) => {
    await fastify.route(route);
  });
};

//start fastify server
const start = async () => {
  try {
    await routePlugin();
    await fastify.listen(process.env.PORT || 4000, "0.0.0.0");
    console.log(`Server Connected on port : ${fastify.server.address().port}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
