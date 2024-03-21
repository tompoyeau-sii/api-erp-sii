const db = require("../../models").pettazzoni.models;

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        const adv = req.body.adv;
        const customer_id = req.body.customer_id;
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
                            return res.status(500).json({ error: "cannot add project" });
                        });
                } else {
                    return res.status(409).json({ error: "project already exist" });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ error: "unable to verify account" });
            });
    },
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
                                model: db.Associate, // Utilisez le modèle Associate ici
                                as: 'managers',          // Utilisez le nom de la relation défini dans le modèle Associate
                                through: {
                                    attributes: ['start_date', 'end_date'], // Incluez les colonnes de la table de liaison
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
            .catch((error) => console.error(error));
    }
}