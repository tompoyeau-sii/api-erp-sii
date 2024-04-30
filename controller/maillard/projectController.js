const db = require("../../models").maillard.models;
module.exports = {
    //Création d'un projet
    create: function (req, res) {
        const label = req.body.label;
        const adv = req.body.adv;
        const customer_id = req.body.customer_id;
        //Vérification que les champs sont bien complétés
        if (
            label == null,
            adv == null,
            customer_id == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }

        db.Project.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (projectFound) {
                //Si un projet du même nom n'existe pas
                if (!projectFound) {
                    db.Project.create({
                        label: label,
                        adv: adv,
                        customer_id: customer_id,
                    })
                        .then(function (newProject) {
                            return res.status(201).json({
                                projectId: newProject.id,
                            });
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "Erreur lors de l'ajout du projet" });
                        });
                //Si il existe
                } else {
                    return res.status(409).json({ error: "Ce projet existe déjà" });
                }
            })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "Erreur lors de la récupération des projets" });
            });
    },
    //Retourne les tous projets
    findAll: function (req, res) {
        db.Project.findAll({
            include: [
                {
                    model: db.Customer,
                    foreignKey: "customer_id",
                },
                {
                    model: db.Mission,
                    foreignKey: "project_id",
                    include: [
                        {
                            model: db.TJM,
                            foreignKey: 'mission_id'
                        },
                        {
                            model: db.Associate,
                            foreignKey: 'associate_id',
                            include: [{
                                model: db.PRU,
                                foreignKey: 'associate_id'
                            },
                            {
                                model: db.Associate,
                                as: 'managers',
                                through: {
                                    attributes: ['start_date', 'end_date'],
                                },
                            },
                            ]
                        }
                    ]
                },
            ]
        })
            .then((project) => {
                return res.status(201).json({
                    project,
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des projets" });
            })
    }
}