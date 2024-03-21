const db = require("../../models").gourmel.models;

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
            .then(genderFound => {
                if (!genderFound) {
                    db.Gender.create({
                        label: label,
                    })
                        .then(newGender => {
                            return res.status(201).json({
                                genderId: newGender.id,
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).json({ error: "Erreur lors de l'ajout du genre " });
                        });
                } else {
                    return res.status(409).json({ error: "Ce genre existe déjà" });
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des genres" });
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
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des genres" });
            })
    },
}