const db = require("../../models").loison.models;
const {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  format,
  parseISO
} = require("date-fns");
const { fr } = require("date-fns/locale");

function today(year) {
  let date = new Date();
  if (date >= new Date(year, 0, 1) && date < new Date(year, 3, 1)) {
    year++; // Si la date est entre le 1er janvier et le 31 mars, l'année est N+1
  }
  date.setFullYear(year)
  return format(date, 'yyyy-MM-dd');
}

module.exports = {
  //Création d'un customer
  create: function (req, res) {
    const label = req.body.label;

    //On vérifie que le champs du label soit bien complété
    if (label == null || label == "") {
      return res.status(400).json({ error: "Libellé manquant" });
    }
    //On recherche si le client existe déjà
    db.Customer.findOne({
      attributes: ["label"],
      where: { label: label },
    })
      .then(customerFound => {
        //Si il existe pas, alors on le créer
        if (!customerFound) {
          db.Customer.create({
            label: label,
          })
            .then(newCustomer => {
              return res.status(201).json({
                success: "Client " + newCustomer.label + " créé.",
              });
            })
            .catch(err => {
              console.log(err)
              return res.status(500).json({ error: "Erreur lors de la création du client" });
            });
          // Si il existe alors on envoie un message d'erreur
        } else {
          return res.status(409).json({ error: "Ce client existe déjà" });
        }
      })
      .catch(err => {
        console.log(err)
        return res.status(500).json({ error: "Problème imprévu, si il persiste, prévenez un administrateur" });
      });
  },
  //Retourne tous les clients ainsi que les infos liés
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
      .catch((err) => {
        console.error(err)
        return res.status(500).json({ error: "Problème server lors de la récupération des clients" });
      });
  },
  //Retourne un client par son id
  findById: function (req, res) {
    const customerId = req.params.id;
    const year = parseInt(req.query.year);
    if (year == null) {
      return res.status(400).json({ error: "Année manquante" });
    }
    db.Customer.findOne({
      where: { id: customerId },
      include: [
        {
          model: db.Project,
          foreignKey: "customer_id",
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
          return res.status(404).json({ error: "Aucun client trouvé" });
        }
        let total_tjm = 0;
        let total_pru = 0;
        let boucle_tjm = 0;
        let boucle_pru = 0;
        customer.Projects.forEach((project) => {
          project.Missions.forEach((mission) => {
            if (
              mission.date_range_mission[0].value <= today(year) &&
              mission.date_range_mission[1].value >= today(year)
            ) {
              mission.TJMs.forEach((TJM) => {
                if (
                  TJM.start_date <= today(year) &&
                  TJM.end_date >= today(year)
                ) {
                  total_tjm += TJM.value;
                  boucle_tjm++;
                }
              });
              mission.Associate.PRUs.forEach((pru) => {
                if (
                  format(parseISO(pru.start_date), "yyyy-MM-dd") <= today(year) &&
                  format(parseISO(pru.end_date), "yyyy-MM-dd") >= today(year)
                ) {
                  total_pru += pru.value;
                  boucle_pru++;
                }
              });
            }
          });
        });
        total_tjm = total_tjm / boucle_tjm;
        total_pru = total_pru / boucle_pru;
        return res.status(200).json({ customer, total_tjm, total_pru });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "Problème server lors de la récupération du client" });
      });
  },
  //Mise à jour d'un client
  update: function (req, res) {
    const customerId = req.params.id; // ID du customer à modifier
    const label = req.body.label; // Nouvelle valeur pour le champ "label"

    //Vérification que les champs sont bien complétés
    if (!customerId || !label) {
      return res.status(400).json({ error: "Veuillez remplir le libelle de l'entreprise" });
    }

    //Le champ label soit faire plus de 2 caractères
    if (label.length <= 2) {
      return res.status(400).json({ error: "Le libelle du client doit faire plus de 2 caractères." });
    }
    //On recherche le client à mettre à jour
    db.Customer.findOne({
      where: { id: customerId },
    })
      .then(customerFound => {
        //Si le client n'est pas trouvé
        if (!customerFound) {
          console.log('error: Aucun client trouvé');
          return res.status(404).json({ error: "Aucun client trouvé" });
          // Sinon on met à jour le label du client
        } else {
          customerFound.update({ label: label })
            .then(updatedCustomer => {
              return res.status(200).json({
                label: updatedCustomer.label,
              });
            })
            .catch(err => {
              console.log(err);
              return res.status(500).json({ error: "Erreur lors de la mise à jour du client" });
            });
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ error: "Erreur server lors de la récupération des données client" });
      });
  },
};
