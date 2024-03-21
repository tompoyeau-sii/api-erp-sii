const { groupBy } = require("async");
const db = require("../../models").pettazzoni.models;
const { Op } = require("sequelize");

function today() {
  var date = new Date();

  // Obtenir les composants de la date
  var annee = date.getFullYear(); // Année à 4 chiffres
  var mois = ('0' + (date.getMonth() + 1)).slice(-2); // Mois (ajoute un zéro devant si nécessaire)
  var jour = ('0' + date.getDate()).slice(-2); // Jour (ajoute un zéro devant si nécessaire)

  // Obtenir les composants de l'heure
  var heures = ('0' + date.getHours()).slice(-2); // Heures (ajoute un zéro devant si nécessaire)
  var minutes = ('0' + date.getMinutes()).slice(-2); // Minutes (ajoute un zéro devant si nécessaire)
  var secondes = ('0' + date.getSeconds()).slice(-2); // Secondes (ajoute un zéro devant si nécessaire)

  // Concaténer les composants dans le format souhaité
  return datedujour = annee + '-' + mois + '-' + jour + ' ' + heures + ':' + minutes + ':' + secondes;
}

module.exports = {
  //Création d'un customer
  create: function (req, res) {
    const label = req.body.label;

    if (label == null || label == "") {
      return res.status(400).json({ error: "Paramètre manquant" });
    }

    db.Customer.findOne({
      attributes: ["label"],
      where: { label: label },
    })
      .then(function (customerFound) {
        if (!customerFound) {
          const newCustomer = db.Customer.create({
            label: label,
          })
            .then(function (newCustomer) {
              return res.status(201).json({
                success: "Nouveau client créé.",
              });
            })
            .catch(function (err) {
              console.log('error: cannot add customer');
              return res.status(500).json({ error: "Ce client existe déjà" });
            });
        } else {
          console.log('error: customer already exist');
          return res.status(409).json({ error: "Ce client existe déjà" });
        }
      })
      .catch(function (err) {
        return res.status(500).json({ error: "Problème imprévu, si il persiste, prévenez le technicien" });
      });
  },

  findAll: function (req, res) {
    db.Customer.findAll({
      order: [['label', 'ASC']],
      include: [
        {
          model: db.Project,
          foreignKey: "customer_id",
          include: [
            {
              model: db.Mission,
              foreignKey: 'project_id',
              include: [
                {
                  model: db.TJM,
                  foreignKey: "mission_id"
                },
                {
                  model: db.Project,
                  foreignKey: "project_id",
                },
                {
                  model: db.Associate,
                  foreignKey: "associate_id",
                  include: {
                    model: db.PRU,
                    foreignKey: 'associate_id'
                  }
                }
              ],
              group: 'associate_id'
            }
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

    db.Customer.findOne({
      where: { id: customerId },
      include: [
        {
          model: db.Project,
          foreignKey: "customer_id",
          // limit: 1,
          include:
            [
              {
                model: db.Mission,
                foreignKey: 'project_id',
                include: [
                  {
                    model: db.TJM,
                    foreignKey: "mission_id"
                  },
                  {
                    model: db.Project,
                    foreignKey: "project_id",
                  },
                  {
                    model: db.Associate,
                    foreignKey: "associate_id",
                    include: {
                      model: db.PRU,
                      foreignKey: 'associate_id'
                    }
                  }
                ],
                group: 'associate_id'
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
      return res.status(400).json({ error: "Veuillez remplir le libelle de l'entreprise" });
    }

    if(label.length <= 2) {
      return res.status(400).json({ error: "Le libelle du client doit faire plus de 2 caractères." });
    }

    db.Customer.findOne({
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

    db.Customer.findOne({
      where: { label: customerLabel },
      include: [
        {
          model: db.Project,
          foreignKey: "customer_id",
          // limit: 1,
          include:
            [
              {
                model: db.Mission,
                foreignKey: 'project_id',
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
