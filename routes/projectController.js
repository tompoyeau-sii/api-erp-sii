const models = require("../models");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        const customer_id = req.body.customer_id;
        const manager_id = req.body.manager_id;
        if (
            label == null,
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
        models.Project.findAll()
            .then((project) => {
                return res.status(201).json({
                    project,
                });
            })
            .catch((error) => console.error(error));
    },
}