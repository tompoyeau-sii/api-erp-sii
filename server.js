const express = require("express");
const bodyParser = require("body-parser");
const apiRouter = require("./apiRouter").router;
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

server.use("/api/", apiRouter);

server.listen(port, function () {
  console.log("Le server écoute sur http://localhost:" + port + "/api-docs");
});
