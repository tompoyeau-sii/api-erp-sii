const models = require("../models");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        const adv = req.body.adv;
        const customer_id = req.body.customer_id;
        const manager_id = req.body.manager_id;
        if (
            label == null,
            adv == null,
            customer_id == null,
            manager_id == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        models.Project.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (projectFound) {
                if (!projectFound) {
                    const newProject = models.Project.create({
                        label: label,
                        adv: adv,
                        customer_id: customer_id,
                        manager_id: manager_id,
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
        models.Project.findAll({
            include: [
                {
                    model: models.Customer,
                    foreignKey: "customer_id",
                },
                {
                    model: models.Mission,
                    foreignKey: "project_id",
                    include: [
                        {
                            model: models.TJM,
                            foreignKey: 'mission_id'
                        },
                        {
                            model: models.Associate,
                            foreignKey: 'associate_id',
                            include: {
                                model: models.PRU,
                                foreignKey: 'associate_id'
                            }
                        }
                    ]
                },
                {
                    model: models.Associate,
                    foreignKey: "manager_id",
                    include: {
                        model: models.PRU,
                        foreignKey: 'associate_id',
                    }
                },
            ]
        })
            .then((project) => {
                return res.status(201).json({
                    project,
                });
            })
            .catch((error) => console.error(error));
    },
    findByCustomerId: function (req, res) {
        const customerId = req.params.id;

        models.Project.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: models.Customer,
                    foreignKey: "customer_id",
                }
            ]
        })
            .then((customer) => {
                if (!customer) {
                    return res.status(404).json({ error: "proejct for this customer not found" });
                }

                return res.status(200).json(customer);
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: "unable to fetch customer" });
            });
    },
}