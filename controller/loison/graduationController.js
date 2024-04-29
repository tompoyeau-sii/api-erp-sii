const db = require("../../models").loison.models;
module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Libellé manquant" });
        }
        db.Graduation.findOne({
            attributes: ["label"],
            where: { label: label },
            order: [["label", "ASC"]]

        })
            .then(graduationFound => {
                if (!graduationFound) {
                    db.Graduation.create({
                        label: label,
                    })
                        .then(newGraduation => {
                            return res.status(201).json({
                                graduationId: newGraduation.id,
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).json({ error: "Erreur lors de l'ajout du diplôme" });
                        });
                } else {
                    return res.status(409).json({ error: "Ce diplôme existe déjà" });
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des diplômes" });
            });
    },
    findAll: function (req, res) {
        db.Graduation.findAll({
            attributes: ["id", "label"],
            order: [["label", "ASC"]]
        })
            .then((graduation) => {
                return res.status(201).json({
                    graduation,
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des diplômes" });

            })
    },
}