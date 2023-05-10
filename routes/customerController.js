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
      include: [
        {
          model: models.Project,
          foreignKey: "customer_id",
          include: [
            {
              model: models.Mission,
              foreignKey: 'project_id',
              duplicating: false
            },
          ]
        }
      ]
    })
      .then((customer) => {
        return res.status(201).json({
          customer,
        });
      })
      .catch((error) => console.error(error));
  },
  findById: function (req, res) {
    const customerId = req.params.id;

    models.Customer.findOne({
      where: { id: customerId },
      include: [
        {
          model: models.Project,
          foreignKey: "customer_id",
          // limit: 1,
          include:
            [
              {
                model: models.Associate,
                foreignKey: 'manager_id'
              },
              {
                model: models.Mission,
                foreignKey: 'project_id',
                include: [
                  {
                    model: models.Associate,
                    foreignKey: 'associate_id'
                  }
                ]
              }
            ]
        }
      ]
    })
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "customer not found" });
        }

        return res.status(200).json(customer);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "unable to fetch customer" });
      });
  },

  update: function (req, res) {
    const customerId = req.params.id; // ID du customer à modifier
    const label = req.body.label; // Nouvelle valeur pour le champ "label"
    if (!customerId || !label) {
      return res.status(400).json({ error: "missing parameters" });
    }

    models.Customer.findOne({
      where: { id: customerId },
    })
      .then(function (customerFound) {
        if (!customerFound) {
          console.log('error: customer not found');
          return res.status(404).json({ error: "customer not found" });
        } else {
          customerFound.update({ label: label })
            .then(function (updatedCustomer) {
              return res.status(200).json({
                customerId: updatedCustomer.id,
                label: updatedCustomer.label,
              });
            })
            .catch(function (err) {
              console.log('error: cannot update customer');
              return res.status(500).json({ error: "cannot update customer" });
            });
        }
      })
      .catch(function (err) {
        console.log('error: unable to verify account');
        return res.status(500).json({ error: "unable to verify account" });
      });
  },

  findByName: function (req, res) {
    const customerLabel = req.params.label;

    models.Customer.findOne({
      where: { label: customerLabel },
      include: [
        {
          model: models.Project,
          foreignKey: "customer_id",
          // limit: 1,
          include:
            [
              {
                model: models.Associate,
                foreignKey: 'manager_id'
              },
              {
                model: models.Mission,
                foreignKey: 'project_id',
                include: [
                  {
                    model: models.Associate,
                    foreignKey: 'associate_id'
                  }
                ]
              }
            ]
        }
      ]
    })
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "customer not found" });
        }

        return res.status(200).json(customer);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "unable to fetch customer" });
      });
  },

};
