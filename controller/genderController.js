const models = require("../models");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        models.Gender.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (genderFound) {
                if (!genderFound) {
                    const newGender = models.Gender.create({
                        label: label,
                    })
                        .then(function (newGender) {
                            return res.status(201).json({
                                genderId: newGender.id,
                            });
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "cannot add job" });
                        });
                } else {
                    return res.status(409).json({ error: "job already exist" });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ error: "unable to verify account" });
            });
    },
    findAll: function (req, res) {
        models.Gender.findAll({
            attributes: ["id", "label"],
        })
            .then((gender) => {
                return res.status(201).json({
                    gender,
                });
            })
            .catch((error) => console.error(error));
    },
}