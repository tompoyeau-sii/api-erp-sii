const express = require("express");
const { verifyToken } = require("../../utils/jwt.utils");

const accountController = require("../../controller/loison/accountController");
const associateController = require("../../controller/loison/associateController");
const customerController = require("../../controller/loison/customerController");
const genderController = require("../../controller/loison/genderController");
const graduationController = require("../../controller/loison/graduationController");
const jobController = require("../../controller/loison/jobController");
const projectController = require("../../controller/loison/projectController");
const missionController = require("../../controller/loison/missionController");
const pdcController = require("../../controller/loison/pdcController");
const statController = require("../../controller/loison/statController");
const environmentController = require("../../controller/loison/environmentController");
const pruController = require("../../controller/loison/pruController");
const workeddaysController = require("../../controller/loison/workeddaysController");

exports.router = (function () {
  const apiRouter = express.Router();

  //Account routes
  apiRouter.route("/login/").post(accountController.login);
  apiRouter.route("/register/").post(accountController.register);
  //Les routes qui suivent ont besoins d'un token pour être appelé
  apiRouter.use(verifyToken);

  apiRouter.route("/accounts").get(accountController.findAll);

  //Associate routes
  apiRouter.route("/associate").post(associateController.create)
  apiRouter.route("/associates").get(associateController.findAllWithLimit)
  apiRouter.route("/associate/:id").get(associateController.findById);
  apiRouter.route("/associate/:id/all").get(associateController.findByIdAllData);
  apiRouter.route("/associate/update/:id").put(associateController.update);
  apiRouter.route("/associates/managers").get(associateController.findManager);
  apiRouter.route("/associates/all").get(associateController.findAll);
  apiRouter.route("/associate/fire/:id").put(associateController.fire);

  //Customer routes
  apiRouter.route("/customer").post(customerController.create);
  apiRouter.route("/customers").get(customerController.findAll);
  apiRouter.route("/customer/:id").get(customerController.findById);
  apiRouter.route("/customer/update/:id").put(customerController.update);

  //environment routes
  apiRouter.route("/simulation/ProdToSimu").post(environmentController.ProdToSimu)
  apiRouter.route("/simulation/CreateSave").post(environmentController.CreateSave)
  apiRouter.route("/simulation/SaveProd").get(environmentController.SaveProd)
  apiRouter.route("/simulation/LoadSave").post(environmentController.LoadSave)
  apiRouter.route("/simulation/LoadSaveFromOtherUser").post(environmentController.LoadSaveFromOtherUser)
  apiRouter.route("/simulation/GetFiles/:id").get(environmentController.GetFiles)
  apiRouter.route("/simulation/DeleteSave").post(environmentController.DeleteSave)

  //Gender routes
  apiRouter.route("/gender").post(genderController.create)
  apiRouter.route("/genders").get(genderController.findAll)

  //Job routes
  apiRouter.route("/job").post(jobController.create)
  apiRouter.route("/jobs").get(jobController.findAll)


  //graduation routes
  apiRouter.route("/graduation").post(graduationController.create)
  apiRouter.route("/graduations").get(graduationController.findAll)


  //mission routes
  apiRouter.route("/mission").post(missionController.create)
  apiRouter.route("/mission/update/:id").put(missionController.update);
  apiRouter.route("/missions").get(missionController.findAll)

  //pdc routes
  apiRouter.route("/pdc/weeks").get(pdcController.createPDCByWeeks)
  apiRouter.route("/pdc/months").get(pdcController.createPDCByMonths)
  apiRouter.route("/pdc/year").get(pdcController.getPdcYear)
  apiRouter.route("/pdc/year").put(pdcController.updatePDCYear);

  //project routes
  apiRouter.route("/project").post(projectController.create)
  apiRouter.route("/projects").get(projectController.findAll)

  //pru routes
  apiRouter.route("/pru/update/:id").put(pruController.update)

  //statistiques routes
  apiRouter.route("/statistiques/manager").get(statController.calculateStatsManager)
  apiRouter.route("/statistiques/agence").get(statController.calculateStatsAgence)
  apiRouter.route("/statistiques/customer").get(statController.calculateStatsCustomer)
  apiRouter.route("/statistiques/customer/actualMonth").get(statController.calculateStatsCustomerActualMonth)

  apiRouter.route("/workeddays").post(workeddaysController.create)
  apiRouter.route("/workeddays/update").put(workeddaysController.update)
  apiRouter.route("/workeddays/associates").get(workeddaysController.getAssociatesWorkedDaysByMonth)
  return apiRouter;
})();
