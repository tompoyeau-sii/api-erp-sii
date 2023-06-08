const models = require("../models");
const { Op } = require("sequelize");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        const associate_id = req.body.associate_id;
        const project_id = req.body.project_id;
        const start_date = req.body.start_date;
        const tjm = req.body.tjm;
        const imputation = req.body.imputation;
        var end_date = req.body.end_date;
        if (req.body.end_date == null) {
            end_date = '9999-12-31';
        }
        if (
            project_id == null,
            associate_id == null,
            start_date == null,
            tjm == null,
            imputation == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        if (start_date > end_date) {
            return res.status(400).json({ error: "La date de début doit être inférieur à la date de fin de la mission" });
        }

        models.Mission.findOne({
            where: {
                associate_id: associate_id,
                project_id: project_id,
                end_date: {
                    [Op.gt]: start_date
                }
            },
        }).then(function (missionFound) {
            if (!missionFound) {
                const newMission = models.Mission.create({
                    associate_id: associate_id,
                    project_id: project_id,
                    start_date: start_date,
                    end_date: end_date,
                }).then(function (newMission) {
                    const newTJM = models.TJM.create({
                        mission_id: newMission.id,
                        start_date: start_date,
                        end_date: end_date,
                        value: tjm,
                    })
                    const newImputation = models.Imputation.create({
                        mission_id: newMission.id,
                        start_date: start_date,
                        end_date: end_date,
                        value: imputation,
                    })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "Imputation / TJM error" });
                        })
                    return res.status(201).json({
                        missionId: newMission.id,
                    })
                }).catch(function (err) {
                    console.log(err)
                    return res.status(500).json({ error: "cannot add mission" });
                });
            } else {
                return res.status(409).json({ error: "Une mission pour ce client et ce collaborateur est déjà en cours sur cette période." });
            }
        })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "unable to verify mission" });
            });
    },
    findAll: function (req, res) {
        models.Mission.findAll({
            include: [
                {
                    model: models.Imputation,
                    foreignKey: "mission_id"
                },
                {
                    model: models.TJM,
                    foreignKey: "mission_id"
                }
            ],
        })
            .then((mission) => {
                return res.status(201).json({
                    mission,
                });
            })
            .catch((error) => console.error(error));
    },
}