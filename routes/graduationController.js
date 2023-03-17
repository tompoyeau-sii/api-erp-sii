const models = require("../models");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        models.Graduation.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (graduationFound) {
                if (!graduationFound) {
                    const newGraduation = models.Graduation.create({
                        label: label,
                    })
                        .then(function (newGraduation) {
                            return res.status(201).json({
                                graduationId: newGraduation.id,
                            });
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "cannot add graduation" });
                        });
                } else {
                    return res.status(409).json({ error: "graduation already exist" });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ error: "unable to verify account" });
            });
    },
    findAll: function (req, res) {
        models.Graduation.findAll({
            attributes: ["id", "label"],
        })
            .then((graduation) => {
                return res.status(201).json({
                    graduation,
                });
            })
            .catch((error) => console.error(error));
    },
}