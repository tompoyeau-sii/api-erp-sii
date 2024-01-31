const express = require("express");
const accountController = require("./routes/accountController");
const associateController = require("./routes/associateController");
const customerController = require("./routes/customerController");
const genderController = require("./routes/genderController");
const graduationController = require("./routes/graduationController");
const jobController = require("./routes/jobController");
const projectController = require("./routes/projectController");
const missionController = require("./routes/missionController");
const pdcController = require("./routes/pdcController");
const testController = require("./routes/testController");
const statController = require("./routes/statController");

exports.router = (function () {
  const apiRouter = express.Router();

  //Account routes
  apiRouter.route("/register/").post(accountController.register);
  apiRouter.route("/login/").post(accountController.login);

  //Customer routes
  apiRouter.route("/customer").post(customerController.create);
  apiRouter.route("/customers").get(customerController.findAll);
  apiRouter.route("/customer/:id").get(customerController.findById);
  // apiRouter.route("/customer/:label").get(customerController.findByName);
  apiRouter.route("/customer/update/:id").post(customerController.update);
  
  //Associate routes
  apiRouter.route("/associate").post(associateController.create)
  apiRouter.route("/associates").get(associateController.findAllWithLimit)
  apiRouter.route("/associate/:id").get(associateController.findById);
  apiRouter.route("/associate/update/:id").post(associateController.update);
  apiRouter.route("/associates/managers").get(associateController.findManager);
  apiRouter.route("/associates/all").get(associateController.findAll);
  
  //Job routes
  apiRouter.route("/job").post(jobController.create)
  apiRouter.route("/jobs").get(jobController.findAll)
  
  //Gender routes
  apiRouter.route("/gender").post(genderController.create)
  apiRouter.route("/genders").get(genderController.findAll)
  
  //graduation routes
  apiRouter.route("/graduation").post(graduationController.create)
  apiRouter.route("/graduations").get(graduationController.findAll)
  
  //project routes
  apiRouter.route("/project").post(projectController.create)
  apiRouter.route("/projects").get(projectController.findAll)
  
  //mission routes
  apiRouter.route("/mission").post(missionController.create)
  apiRouter.route("/mission/update/:id").post(missionController.update);
  apiRouter.route("/missions").get(missionController.findAll)
  apiRouter.route("/missions/ongoing").get(missionController.findAllOngoing)

  //pdc routes
  apiRouter.route("/pdc").get(pdcController.createPDC)
  apiRouter.route("/pdc/year").get(pdcController.getPdcYear)
  apiRouter.route("/pdc/year").post(pdcController.updatePDCYear);
  
  //pdc routes
  apiRouter.route("/test").get(testController.test)

  //statistiques routes
  apiRouter.route("/statistiques/manager").get(statController.calculateStatsManager)
  apiRouter.route("/statistiques/agence").get(statController.calculateStatsAgence)
  apiRouter.route("/statistiques/customer").get(statController.calculateStatsCustomer)
  apiRouter.route("/statistiques/customer/actualMonth").get(statController.calculateStatsCustomerActualMonth)

  return apiRouter;
})();
