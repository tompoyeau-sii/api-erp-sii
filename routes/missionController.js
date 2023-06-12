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


    /*
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
            label == null,
            associate_id == null,
            project_id == null,
            tjm == null,
            other_mission_id == null,
            other_mission_start == null,
            other_mission_end == null,
            new_mission_imputation == null,
            start_date == null,
            end_date == null
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
                    label: label,
                    associate_id: associate_id,
                    project_id: project_id,
                    start_date: start_date,
                    end_date: end_date,
                }).then(function (newMission) {
                    const newTJM = models.TJM.create({
                        mission_id: newMission.id,
                        start_date: newMission.start_date,
                        end_date: newMission.end_date,
                        value: tjm,
                    }).catch(function (err) {
                        console.log(err)
                        return res.status(500).json({ error: "Problème création de mission / TJM" });
                    });

                    if (other_mission_id != null) {
                        // Lister la/les imputations de la mission se passant pendant la période de la nouvelle mission
                        models.Imputation.findAll({
                            where: {
                                mission_id: other_mission_id,
                            }
                        }).then(function (other_imputation) {
                            //Si l'autre mission commence avant la nouvelle mission 
                            console.log(other_imputation)
                            if (other_imputation.start_date < start_date) {
                                console.log("une mission a déjà commencé")
                                // Mettre à jour la date de fin de l'ancienne imputation de la other mission par la date de début de la nouvelle mission
                                other_imputation.update({
                                    end_date: start_date
                                })
                                // Si la nouvelle mission se fini pendant l'ancienne
                                if (end_date < other_mission_end) {
                                    // On créer la nouvelle imputation de l'ancienne avec start = new_mission.start_date et end = new_mission.end
                                    models.Imputation.create({
                                        mission_id: other_mission_id,
                                        start_date: start_date,
                                        end_date: end_date,
                                        value: other_mission_imputation,
                                    })
                                    // On créer l'imputation pour la nouvelle mission avec start = newMission.start_date et end = newMission.end
                                    models.Imputation.create({
                                        mission_id: newMission.id,
                                        start_date: newMission.start_date,
                                        end_date: newMission.end_date,
                                        value: new_mission_imputation,
                                    })
                                    // On créer l'imputation pour l'ancienne mission après la fin de la nouvelle. start = new_mission.end et end = other_mission.end
                                    models.Imputation.create({
                                        mission_id: other_mission_id,
                                        start_date: newMission.end_date,
                                        end_date: other_mission_end,
                                        value: 100,
                                    })
                                    //Si la nouvelle mission commence pendant l'ancienne mais fini après
                                } else if (end_date > other_mission_end) {
                                    // On créer la nouvelle imputation de l'ancienne avec start = new_mission.start_date et end = new_mission.end
                                    models.Imputation.create({
                                        mission_id: other_mission_id,
                                        start_date: start_date,
                                        end_date: end_date,
                                        value: other_mission_imputation,
                                    })
                                    // On créer l'imputation pour la nouvelle mission avec start = newMission.start_date et end = other_mission_end
                                    models.Imputation.create({
                                        mission_id: newMission.id,
                                        start_date: newMission.start_date,
                                        end_date: other_mission_end,
                                        value: new_mission_imputation,
                                    })
                                    // On créer l'imputation pour la nouvelle mission après la fin de l'ancienne. start = other_mission_end  et end = newMission.end_date
                                    models.Imputation.create({
                                        mission_id: newMission.id,
                                        start_date: other_mission_end,
                                        end_date: newMission.end_date,
                                        value: 100,
                                    })
                                }
                                // Si l'aute mission commence pendant la nouvelle mission et continue après la fin de la nouvelle
                            } else if (other_mission_start > newMission.start_date && other_mission_start < newMission.end_date && other_mission_end > newMission.end_date) {
                                console.log("une mission commence pendant la période et se termine après")
                                //On supprime l'imputation de la mission qui n'a pas encore commencé
                                other_imputation.destroy()
                                models.Imputation.create({
                                    mission_id: newMission.id,
                                    start_date: newMission.start_date,
                                    end_date: other_mission_start,
                                    value: 100,
                                })
                                models.Imputation.create({
                                    mission_id: newMission.id,
                                    start_date: other_mission_start,
                                    end_date: newMission.end_date,
                                    value: new_mission_imputation,
                                })
                                models.Imputation.create({
                                    mission_id: other_mission_id,
                                    start_date: other_mission_start,
                                    end_date: newMission.end_date,
                                    value: other_mission_imputation,
                                })
                                models.Imputation.create({
                                    mission_id: other_mission_id,
                                    start_date: newMission.end_date,
                                    end_date: other_mission_end,
                                    value: 100,
                                })
                                // Si l'autre mission commence pendant la nouvelle mission et fini pendant
                            } else if (other_mission_start > newMission.start_date && other_mission_end < newMission.end_date) {
                                console.log("une mission commence pendant la période et se termine pendant")
                                other_imputation.destroy()
                                models.Imputation.create({
                                    mission_id: newMission.id,
                                    start_date: newMission.start_date,
                                    end_date: other_mission_start,
                                    value: 100,
                                })
                                models.Imputation.create({
                                    mission_id: newMission.id,
                                    start_date: other_mission_start,
                                    end_date: other_mission_end,
                                    value: new_mission_imputation,
                                })
                                models.Imputation.create({
                                    mission_id: other_mission_id,
                                    start_date: other_mission_start,
                                    end_date: other_mission_end,
                                    value: other_mission_imputation,
                                })
                                models.Imputation.create({
                                    mission_id: newMission.id,
                                    start_date: other_mission_end,
                                    end_date: newMission.start_date,
                                    value: 100,
                                })
                            } 
                        })
                    } else {
                        models.Imputation.create({
                            mission_id: newMission.id,
                            start_date: newMission.start_date,
                            end_date: newMission.end_date,
                            value: 100,
                        })
                    }
                    return res.status(201).json({
                        missionId: newMission.id,
                    })
                }).catch(function (err) {
                    console.log(err)
                    return res.status(500).json({ error: "cannot add mission" });
                });
            } else {
                return res.status(409).json({ error: "Une mission sur ce projet et ce collaborateur est déjà en cours sur cette période." });
            }
        })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "unable to verify mission" });
            });
    },
*/
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