const models = require("../models");
const { Op } = require("sequelize");

module.exports = {

    create: function (req, res) {
        const label = req.body.label;
        const associate_id = req.body.associate_id;
        const project_id = req.body.project_id;
        const tjm = req.body.tjm;
        const other_mission_id = req.body.old_mission_id;
        const other_mission_start = req.body.old_mission_start;
        const other_mission_end = req.body.old_mission_end;
        const other_mission_imputation = req.body.old_mission_imputation;
        const new_mission_imputation = req.body.new_mission_imputation;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;

        if (
            label == null ||
            associate_id == null ||
            project_id == null ||
            tjm == null ||
            new_mission_imputation == null ||
            start_date == null ||
            end_date == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }

        if (start_date > end_date) {
            return res.status(400).json({ error: "La date de début doit être inférieure à la date de fin de la mission" });
        }

        models.Mission.findOne({
            where: {
                associate_id: associate_id,
                project_id: project_id,
                end_date: {
                    [Op.gt]: start_date
                }
            }
        }).then(function (missionFound) {
            if (!missionFound) {
                models.Mission.create({
                    label: label,
                    associate_id: associate_id,
                    project_id: project_id,
                    start_date: start_date,
                    end_date: end_date
                }).then(function (newMission) {
                    models.TJM.create({
                        mission_id: newMission.id,
                        start_date: newMission.start_date,
                        end_date: newMission.end_date,
                        value: tjm
                    }).then(function () {
                        if (other_mission_id != null) {
                            models.Imputation.findAll({
                                where: {
                                    mission_id: other_mission_id
                                }
                            }).then(function (other_imputations) {
                                other_imputations.forEach(function (other_imputation) {
                                    // si la nouvelle mission commence après l'autre mission
                                    if (other_imputation.start_date < start_date) {
                                        other_imputation.update({
                                            end_date: start_date
                                        }).then(function () {
                                            // si la nouvelle mission fini pendant l'autre mission
                                            if (end_date < other_mission_end) {
                                                models.Imputation.create({
                                                    mission_id: other_mission_id,
                                                    start_date: start_date,
                                                    end_date: end_date,
                                                    value: other_mission_imputation
                                                }).then(function () {
                                                    models.Imputation.create({
                                                        mission_id: newMission.id,
                                                        start_date: newMission.start_date,
                                                        end_date: newMission.end_date,
                                                        value: new_mission_imputation
                                                    }).then(function () {
                                                        models.Imputation.create({
                                                            mission_id: other_mission_id,
                                                            start_date: newMission.end_date,
                                                            end_date: other_mission_end,
                                                            value: 100
                                                        }).then(function () {
                                                            return res.status(201).json({
                                                                missionId: newMission.id
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de l'imputation pour l'ancienne mission après la fin de la nouvelle" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de l'imputation pour la nouvelle mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de l'imputation pour l'ancienne mission" });
                                                });
                                                //Si la nouvelle mission fini après l'autre mission
                                            } else if (end_date > other_mission_end) {
                                                models.Imputation.create({
                                                    mission_id: other_mission_id,
                                                    start_date: start_date,
                                                    end_date: other_mission_end,
                                                    value: other_mission_imputation
                                                }).then(function () {
                                                    models.Imputation.create({
                                                        mission_id: newMission.id,
                                                        start_date: newMission.start_date,
                                                        end_date: other_mission_end,
                                                        value: new_mission_imputation
                                                    }).then(function () {
                                                        models.Imputation.create({
                                                            mission_id: newMission.id,
                                                            start_date: other_mission_end,
                                                            end_date: newMission.end_date,
                                                            value: 100
                                                        }).then(function () {
                                                            return res.status(201).json({
                                                                missionId: newMission.id
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de l'imputation pour la nouvelle mission après la fin de l'ancienne" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de l'imputation pour la nouvelle mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de l'imputation pour l'ancienne mission" });
                                                });
                                            }
                                        }).catch(function (err) {
                                            console.log(err);
                                            return res.status(500).json({ error: "Problème lors de la mise à jour de l'imputation pour l'ancienne mission" });
                                        });
                                    //Si l'autre mission commence pendant la nouvelle mission et continue après 
                                    } else if (other_mission_start > newMission.start_date && other_mission_start < newMission.end_date && other_mission_end > newMission.end_date) {
                                        other_imputation.destroy().then(function () {
                                            models.Imputation.create({
                                                mission_id: newMission.id,
                                                start_date: newMission.start_date,
                                                end_date: other_mission_start,
                                                value: 100
                                            }).then(function () {
                                                models.Imputation.create({
                                                    mission_id: newMission.id,
                                                    start_date: other_imputation.start_date,
                                                    end_date: newMission.end_date,
                                                    value: new_mission_imputation
                                                }).then(function () {
                                                    models.Imputation.create({
                                                        mission_id: other_mission_id,
                                                        start_date: other_imputation.start_date,
                                                        end_date: newMission.end_date,
                                                        value: other_mission_imputation
                                                    }).then(function () {
                                                        models.Imputation.create({
                                                            mission_id: other_mission_id,
                                                            start_date: newMission.end_date,
                                                            end_date: other_mission_end,
                                                            value: 100
                                                        }).then(function () {
                                                            return res.status(201).json({
                                                                missionId: newMission.id
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de l'imputation pour l'ancienne mission après la fin de la nouvelle" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de l'imputation pour la nouvelle mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de l'imputation pour l'ancienne mission" });
                                                });
                                            }).catch(function (err) {
                                                console.log(err);
                                                return res.status(500).json({ error: "Problème lors de la création de l'imputation pour la nouvelle mission" });
                                            });
                                        }).catch(function (err) {
                                            console.log(err);
                                            return res.status(500).json({ error: "Problème lors de la suppression de l'imputation pour l'ancienne mission" });
                                        });
                                    }
                                });
                            }
                            )
                        } else {
                            models.Imputation.create({
                                mission_id: newMission.id,
                                start_date: newMission.start_date,
                                end_date: newMission.end_date,
                                value: new_mission_imputation
                            }).then((imputation) => {
                                return res.status(201).json({
                                    missionId: newMission.id,
                                });
                            }).catch(function (err) {
                                console.log(err);
                                return res.status(500).json({ error: "Problème lors de la création de l'imputation" });
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        return res.status(500).json({ error: "Problème lors de la création du TJM" });
                    });
                }).catch(function (err) {
                    console.log(err);
                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                });
            } else {
                return res.status(409).json({ error: "Une mission existe déjà pour cet associé et ce projet avec une date de fin supérieure à la date de début de la nouvelle mission" });
            }
        }).catch(function (err) {
            console.log(err);
            return res.status(500).json({ error: "Problème lors de la recherche de la mission existante" });
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
                },
                {
                    model: models.Project,
                    foreignKey: "project_id",
                    include: {
                        model: models.Associate,
                        foreignKey: 'manager_id',
                        include: {
                            model: models.PRU,
                            foreignKey: 'associate_id'
                        }

                    }
                },
                {
                    model: models.Associate,
                    foreignKey: "associate_id",
                    include: {
                        model: models.PRU,
                        foreignKey: 'associate_id'
                    }
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