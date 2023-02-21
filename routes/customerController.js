const models = require("../models");

module.exports = {
  //Création d'un customer
  create: function (req, res) {
    const label = req.body.label;

    if (label == null) {
      return res.status(400).json({ error: "missing parameters" });
    }

    models.Customer.findOne({
      attributes: ["label"],
      where: { label: label },
    })
      .then(function (customerFound) {
        if (!customerFound) {
          const newCustomer = models.Customer.create({
            label: label,
          })
            .then(function (newCustomer) {
              return res.status(201).json({
                customerId: newCustomer.id,
              });
            })
            .catch(function (err) {
              console.log('error: cannot add customer');
              return res.status(500).json({ error: "cannot add customer" });
            });
        } else {
          console.log('error: customer already exist');
          return res.status(409).json({ error: "customer already exist" });
        }
      })
      .catch(function (err) {
        return res.status(500).json({ error: "unable to verify account" });
      });
  },

  findAll: function (req, res) {
    models.Customer.findAll({
      attributes: ["id", "label"],
    })
      .then((customer) => {
        return res.status(201).json({
          customer,
        });
      })
      .catch((error) => console.error(error));
  },

};
