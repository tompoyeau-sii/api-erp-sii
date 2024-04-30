const db = require("../../models").maillard.models;

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Libellé manquant" });
        }
        db.Job.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(jobFound => {
                if (!jobFound) {
                    db.Job.create({
                        label: label,
                    })
                        .then(newJob => {
                            return res.status(201).json({
                                jobId: newJob.id,
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).json({ error: "Erreur server lors de la création du poste" });
                        });
                } else {
                    return res.status(409).json({ error: "Ce poste existe déjà" });
                }
            })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "Erreur server lors de la récupération des postes" });
            });
    },
    findAll: function (req, res) {
        db.Job.findAll({
            attributes: ["id", "label"],
            order: [["label", "ASC"]]
        })
            .then((job) => {
                return res.status(201).json({
                    job,
                });
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({ error: "Erreur server lors de la récupération des postes" });
            })
    },
}