const express = require("express");
const accountController = require("./routes/accountController");
const associateController = require("./routes/associateController");
const customerController = require("./routes/customerController");
exports.router = (function () {
  const apiRouter = express.Router();

  //Account routes
  apiRouter.route("/account/register/").post(accountController.register);
  apiRouter.route("/account/login/").post(accountController.login);

  //Customer routes
  apiRouter.route("/customer").post(customerController.create);
  apiRouter.route("/customer").get(customerController.findAll);

  //Associate routes
  apiRouter.route("/associate").post(associateController.create)
  apiRouter.route("/associate").get(associateController.findAll)

  return apiRouter;
})();
