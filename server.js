const express = require("express");
const bodyParser = require("body-parser");
const apiRouterProduction = require("./routes/production/productionRouter").router;
const apiRouterLoison = require("./routes/loison/loisonRouter").router;
const apiRouterPettazzoni = require("./routes/pettazzoni/pettazzoniRouter").router;
const apiRouterGourmel = require("./routes/gourmel/gourmelRouter").router;
const cors = require('cors');
const port = 8080;
const server = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

server.use(cors({
  origin: '*',
}));

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.get("/", function (req, res) {
  res.status(200).send("Server online");
});

server.use("/api/production", apiRouterProduction);
server.use("/api/pettazzoni", apiRouterPettazzoni);
server.use("/api/gourmel", apiRouterGourmel);
server.use("/api/loison", apiRouterLoison);

server.listen(port, function () {
  console.log("Le server écoute sur http://localhost:" + port + "/api-docs");
});
 