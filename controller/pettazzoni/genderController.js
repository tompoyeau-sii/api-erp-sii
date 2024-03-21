const db = require("../../models").pettazzoni.models;

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        db.Gender.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (genderFound) {
                if (!genderFound) {
                    db.Gender.create({
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
                console.log(err)
                return res.status(500).json({ error: "unable to verify account" });
            });
    },
    findAll: function (req, res) {
        db.Gender.findAll({
            attributes: ["id", "label"],
        })
            .then((gender) => {
                return res.status(201).json({
                    gender,
                });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: "unable to verify account" });
            });
    },
}