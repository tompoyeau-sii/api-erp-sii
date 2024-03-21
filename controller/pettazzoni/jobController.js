const db = require("../../models").pettazzoni.models;

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        if (
            label == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        db.Job.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (jobFound) {
                if (!jobFound) {
                    db.Job.create({
                        label: label,
                    })
                        .then(function (newJob) {
                            return res.status(201).json({
                                jobId: newJob.id,
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
        db.Job.findAll({
            attributes: ["id", "label"],
        })
            .then((job) => {
                return res.status(201).json({
                    job,
                });
            })
            .catch((error) => console.error(error));
    },
}