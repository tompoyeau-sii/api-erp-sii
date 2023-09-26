const models = require("../models");
const { Op } = require("sequelize");

function today() {
    var date = new Date();

    // Obtenir les composants de la date
    var annee = date.getFullYear(); // Année à 4 chiffres
    var mois = ('0' + (date.getMonth() + 1)).slice(-2); // Mois (ajoute un zéro devant si nécessaire)
    var jour = ('0' + date.getDate()).slice(-2); // Jour (ajoute un zéro devant si nécessaire)

    // Obtenir les composants de l'heure
    var heures = ('0' + date.getHours()).slice(-2); // Heures (ajoute un zéro devant si nécessaire)
    var minutes = ('0' + date.getMinutes()).slice(-2); // Minutes (ajoute un zéro devant si nécessaire)
    var secondes = ('0' + date.getSeconds()).slice(-2); // Secondes (ajoute un zéro devant si nécessaire)

    // Concaténer les composants dans le format souhaité
    return datedujour = annee + '-' + mois + '-' + jour + ' ' + heures + ':' + minutes + ':' + secondes;
}

module.exports = {

    create: function (req, res) {
        const label = req.body.label; // label de la mission
        const associate_id = req.body.associate_id; // collab concerné par la mission
        const project_id = req.body.project_id; //project concerné par la mission
        const tjm = req.body.tjm; // tjm de la mission
        const start_date = req.body.start_date; // date de début de la nouvelle mission
        const end_date = req.body.end_date; //date de fin de la nouvelle mission
        const other_mission_id = req.body.old_mission_id; // id de l'autre mission qui se passe en même temps
        const other_mission_start = req.body.old_mission_start; // date de début de l'autre mission
        const other_mission_end = req.body.old_mission_end; // date de fin de l'autre mission
        const other_mission_imputation = req.body.old_mission_imputation; // imputation de l'autre mission
        const new_mission_imputation = req.body.new_mission_imputation; // imputation de la nouvelle mission
        const other_mission_label = req.body.other_mission_label; // label de l'autre mission
        const other_mission_project = req.body.other_mission_project; // project de l'autre mission

        //Vérification si les paramètres sont bien complet
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
        // On vérifie que la date de début n'est pas après la date de fin
        if (start_date > end_date) {
            return res.status(400).json({ error: "La date de début doit être inférieure à la date de fin de la mission" });
        }

        // On recherche le collaborateur
        models.Associate.findOne({
            where: {
                id: associate_id
            }
        }).then(function (associateFound) {
            // Avec le collaborateur trouvé, on vérifie que le collaborateur est bien chez SII durant la période de la mission 
            if (associateFound.start_date <= start_date && (associateFound.end_date >= end_date || associateFound.end_date == null)) {
                // On recherche si une mission existe déjà pour ce collaborateur et ce projet dans la période
                models.Mission.findOne({
                    where: {
                        associate_id: associate_id,
                        project_id: project_id,
                        end_date: {
                            [Op.gt]: start_date
                        },
                        start_date: {
                            [Op.lt]: start_date
                        }
                    }
                }).then(function (missionFound) {
                    // Si aucune mission n'existe avec les critère précédent alors on créer la mission
                    if (!missionFound) {
                        // on vérifie si il y a une autre mission en simultanée
                        if (other_mission_id != null) {
                            // Si on a une autre mission on recherche ses imputation
                            models.Mission.findAll({
                                where: {
                                    reference: other_mission_label + "_" + other_mission_project
                                }
                            }).then(function (other_missions) {
                                other_missions.forEach(function (other_mission) {
                                    // si la nouvelle mission commence après le début de l'autre mission
                                    if (other_mission.start_date < start_date) {
                                        // si la nouvelle mission fini pendant l'autre mission
                                        if (end_date < other_mission_end) {
                                            console.log("Mission qui commence pendant et qui fini pendan l'autre")
                                            // On modifie les autres imputation de l'autre mission
                                            models.Mission.findOne({
                                                where: {
                                                    id: other_mission_id,
                                                }
                                            }).then(function (imputated_mission) {
                                                imputated_mission.update({
                                                    imputation_end: start_date,
                                                }).then(function () {
                                                    // On créer une nouvelle imputation pour l'autre mission
                                                    models.Mission.create({
                                                        reference: other_mission_label + "_" + other_mission_project,
                                                        label: other_mission_label,
                                                        associate_id: associate_id,
                                                        project_id: other_mission_project,
                                                        start_date: other_mission.start_date,
                                                        end_date: other_mission.end_date,
                                                        imputation_value: other_mission_imputation,
                                                        imputation_start: start_date,
                                                        imputation_end: end_date
                                                    }).then(function () {
                                                        //on créer la nouvelle mission
                                                        models.Mission.create({
                                                            reference: label + "_" + project_id,
                                                            label: label,
                                                            associate_id: associate_id,
                                                            project_id: project_id,
                                                            start_date: start_date,
                                                            end_date: end_date,
                                                            imputation_value: new_mission_imputation,
                                                            imputation_start: start_date,
                                                            imputation_end: end_date
                                                        }).then(function (new_mission) {
                                                            // On créer le TJM 
                                                            models.TJM.create({
                                                                mission_id: new_mission.id,
                                                                mission_reference: new_mission.reference,
                                                                start_date: new_mission.start_date,
                                                                end_date: new_mission.end_date,
                                                                value: tjm,
                                                            }).then(function () {
                                                                // On créer l'imputation de l'other mission après
                                                                models.Mission.create({
                                                                    reference: other_mission_label + "_" + other_mission_project,
                                                                    label: other_mission_label,
                                                                    associate_id: associate_id,
                                                                    project_id: other_mission_project,
                                                                    start_date: other_mission.start_date,
                                                                    end_date: other_mission.end_date,
                                                                    imputation_value: 100,
                                                                    imputation_start: end_date,
                                                                    imputation_end: other_mission.end_date,
                                                                }).then(function (mission) {
                                                                    return res.status(201).json({
                                                                        missionId: mission.id,
                                                                    });
                                                                })
                                                                    .catch(function (err) {
                                                                        console.log(err);
                                                                        return res.status(500).json({ error: "Problème lors de la création de la mission dans le cas" });
                                                                    });
                                                            }).catch(function (err) {
                                                                console.log(err);
                                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                });
                                            })
                                        } 
                                        // Si la nouvelle mission fini après l'autre mission
                                        else if (end_date > other_mission_end) {
                                            console.log("Mission qui commence pendant et qui fini après")
                                            // On retrouve l'autre mission
                                            models.Mission.findOne({
                                                where: {
                                                    id: other_mission_id,
                                                }
                                            }).then(function (imputated_mission) {
                                                // On modifie sa date de fin par la date de début de l'autre mission  
                                                imputated_mission.update({
                                                    imputation_end: start_date
                                                }).then(function () {
                                                    // On créer une nouvelle imputation pour l'autre mission
                                                    models.Mission.create({
                                                        reference: other_mission_label + "_" + other_mission_project,
                                                        label: other_mission_label,
                                                        associate_id: associate_id,
                                                        project_id: project_id,
                                                        start_date: other_mission.start_date,
                                                        end_date: other_mission.end_date,
                                                        imputation_value: other_mission_imputation,
                                                        imputation_start: start_date,
                                                        imputation_end: other_mission.end_date
                                                    }).then(function (new_other_imputation) {
                                                        //on créer la nouvelle mission
                                                        models.Mission.create({
                                                            reference: label + "_" + project_id,
                                                            label: label,
                                                            associate_id: associate_id,
                                                            project_id: project_id,
                                                            start_date: start_date,
                                                            end_date: end_date,
                                                            imputation_value: new_mission_imputation,
                                                            imputation_start: start_date,
                                                            imputation_end: new_other_imputation.end_date
                                                        }).then(function (new_mission) {
                                                            // On créer le TJM
                                                            models.TJM.create({
                                                                mission_id: new_mission.id,
                                                                mission_reference: new_mission.reference,
                                                                start_date: new_mission.start_date,
                                                                end_date: new_mission.end_date,
                                                                value: tjm,
                                                            }).then(function () {
                                                                // On créer l'imputation de la nouvelle mission après
                                                                models.Mission.create({
                                                                    reference: label + "_" + project_id,
                                                                    label: label,
                                                                    associate_id: associate_id,
                                                                    project_id: project_id,
                                                                    start_date: start_date,
                                                                    end_date: end_date,
                                                                    imputation_value: 100,
                                                                    imputation_start: new_other_imputation.end_date,
                                                                    imputation_end: end_date,
                                                                }).then(function (mission) {
                                                                    return res.status(201).json({
                                                                        missionId: mission.id,
                                                                    });
                                                                })
                                                                    .catch(function (err) {
                                                                        console.log(err);
                                                                        return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                                    });
                                                            }).catch(function (err) {
                                                                console.log(err);
                                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                    });
                                                })
                                            }).catch(function (err) {
                                                console.log(err);
                                                return res.status(500).json({ error: "Problème lors de la mise à jour de l'imputation pour l'ancienne mission" });
                                            });
                                        }
                                        //Si l'autre mission commence pendant la nouvelle mission et continue après 
                                    }
                                    // Si la nouvelle mission commence avant l'autre mission 
                                    else if (other_mission.start_date > start_date) {
                                        // si la nouvelle mission fini pendant l'autre mission 
                                        if (other_mission.end_date > end_date) {
                                            console.log("Mission qui avant et qui fini pendant l'autre mission")
                                            // on récupère l'autre mission
                                            models.Mission.findOne({
                                                where: {
                                                    id: other_mission_id,
                                                }
                                            }).then(function (other_imputation) {
                                                // on créer la nouvelle mission 
                                                models.Mission.create({
                                                    reference: label + "_" + project_id,
                                                    label: label,
                                                    associate_id: associate_id,
                                                    project_id: project_id,
                                                    start_date: start_date,
                                                    end_date: end_date,
                                                    imputation_value: 100,
                                                    imputation_start: start_date,
                                                    imputation_end: other_imputation.imputation_start
                                                }).then(function (new_mission) {
                                                    // On créer le TJM
                                                    models.TJM.create({
                                                        mission_id: new_mission.id,
                                                        mission_reference: new_mission.reference,
                                                        start_date: new_mission.start_date,
                                                        end_date: new_mission.end_date,
                                                        value: tjm,
                                                    }).then(function () {

                                                        // on créer l'imputation pendant la période d'imputation pour la nouvelle mission
                                                        models.Mission.create({
                                                            reference: label + "_" + project_id,
                                                            label: label,
                                                            associate_id: associate_id,
                                                            project_id: project_id,
                                                            start_date: start_date,
                                                            end_date: end_date,
                                                            imputation_value: new_mission_imputation,
                                                            imputation_start: other_imputation.imputation_start,
                                                            imputation_end: end_date
                                                        }).then(function (new_mission_imputed) {
                                                            // on modifie l'autre imputation
                                                            other_imputation.update({
                                                                imputation_value: other_mission_imputation,
                                                                imputation_end: new_mission_imputed.end_date,
                                                            }).then(function (other_mission_imputed) {
                                                                // on créer l'imputation après pour l'autre mission
                                                                models.Mission.create({
                                                                    reference: other_mission_imputed.reference,
                                                                    label: other_mission_imputed.label,
                                                                    associate_id: other_mission_imputed.associate_id,
                                                                    project_id: other_mission_project,
                                                                    start_date: other_mission_imputed.start_date,
                                                                    end_date: other_mission_imputed.end_date,
                                                                    imputation_value: 100,
                                                                    imputation_start: new_mission_imputed.end_date,
                                                                    imputation_end: other_mission_end,
                                                                }).then(function (mission) {
                                                                    return res.status(201).json({
                                                                        missionId: mission.id,
                                                                    })
                                                                }).catch(function (err) {
                                                                    console.log(err);
                                                                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                                });
                                                            }).catch(function (err) {
                                                                console.log(err);
                                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                });
                                            }).catch(function (err) {
                                                console.log(err);
                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                            });
                                        }
                                        // Si le nouvelle mission fini après l'autre
                                        else if (other_mission.end_date < end_date) {
                                            console.log("Mission qui commence avant et qui fini après l'autre mission")
                                            // on récupère l'autre mission
                                            models.Mission.findOne({
                                                where: {
                                                    id: other_mission_id,
                                                }
                                            }).then(function (other_imputation) {
                                                // on créer la nouvelle mission 
                                                models.Mission.create({
                                                    reference: label + "_" + project_id,
                                                    label: label,
                                                    associate_id: associate_id,
                                                    project_id: project_id,
                                                    start_date: start_date,
                                                    end_date: end_date,
                                                    imputation_value: 100,
                                                    imputation_start: start_date,
                                                    imputation_end: other_imputation.imputation_start
                                                }).then(function (new_mission) {
                                                    //On créer le TJM
                                                    models.TJM.create({
                                                        mission_id: new_mission.id,
                                                        mission_reference: new_mission.reference,
                                                        start_date: new_mission.start_date,
                                                        end_date: new_mission.end_date,
                                                        value: tjm,
                                                    }).then(function () {

                                                        // on créer l'imputation pendant l'imputation pour la nouvelle mission
                                                        models.Mission.create({
                                                            reference: label + "_" + project_id,
                                                            label: label,
                                                            associate_id: associate_id,
                                                            project_id: project_id,
                                                            start_date: start_date,
                                                            end_date: end_date,
                                                            imputation_value: new_mission_imputation,
                                                            imputation_start: other_imputation.imputation_start,
                                                            imputation_end: end_date
                                                        }).then(function (new_mission_imputed) {
                                                            // on modifie l'autre imputation
                                                            other_imputation.update({
                                                                imputation_value: other_mission_imputation,
                                                                imputaiton_end: new_mission_imputed.end_date,
                                                            }).then(function (other_mission_imputed) {
                                                                // on créer l'imputation après pour l'autre mission
                                                                models.Mission.create({
                                                                    reference: label + "_" + project_id,
                                                                    label: label,
                                                                    associate_id: associate_id,
                                                                    project_id: project_id,
                                                                    start_date: start_date,
                                                                    end_date: end_date,
                                                                    imputation_value: 100,
                                                                    imputation_start: other_mission_imputed.end_date,
                                                                    imputation_end: end_date,
                                                                }).then(function (mission) {
                                                                    return res.status(201).json({
                                                                        missionId: mission.id,
                                                                    })
                                                                }).catch(function (err) {
                                                                    console.log(err);
                                                                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                                });
                                                            }).catch(function (err) {
                                                                console.log(err);
                                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                    });
                                                }).catch(function (err) {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                                });
                                            }).catch(function (err) {
                                                console.log(err);
                                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                                            });
                                        }
                                    }
                                });
                            }
                            )
                        } else {
                            models.Mission.create({
                                reference: label + "_" + project_id,
                                label: label,
                                associate_id: associate_id,
                                project_id: project_id,
                                imputation_value: new_mission_imputation,
                                imputation_start: start_date,
                                imputation_end: end_date,
                                start_date: start_date,
                                end_date: end_date,
                            }).then((mission) => {
                                models.TJM.create({
                                    mission_id: mission.id,
                                    mission_reference: mission.reference,
                                    start_date: mission.start_date,
                                    end_date: mission.end_date,
                                    value: tjm,
                                }).then((tjm) => {
                                    return res.status(201).json({
                                        missionId: mission.id,
                                    });
                                })
                            }).catch(function (err) {
                                console.log(err);
                                return res.status(500).json({ error: "Problème lors de la création de la mission" });
                            });
                        }

                    } else {
                        return res.status(409).json({ error: "Une mission existe déjà pour cet associé et ce projet avec une date de fin supérieure à la date de début de la nouvelle mission" });
                    }
                }).catch(function (err) {
                    console.log(err);
                    return res.status(500).json({ error: "Erreur lors de la recherche de l'existance de la mission" });
                });
            } else {
                return res.status(500).json({ error: "Les dates ne correspondent pas avec les dates d'embauche ou de départ du collaborateur" });
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
                },
                {
                    model: models.Associate,
                    foreignKey: "associate_id",
                    include: [
                        {
                            model: models.PRU,
                            foreignKey: 'associate_id'
                        },
                        {
                            model: models.Associate, // Utilisez le modèle Associate ici
                            as: 'managers',          // Utilisez le nom de la relation défini dans le modèle Associate
                            through: {
                                attributes: ['start_date', 'end_date'] // Incluez les colonnes de la table de liaison
                            }
                        },
                    ]
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
    findAllOngoing: function (req, res) {
        models.Mission.findAll({
            where: {
                [Op.and]: [
                    {
                        start_date: {
                            [Op.lt]: today()
                        }
                    },
                    {
                        end_date: {
                            [Op.gt]: today()
                        }
                    }
                ]
            },
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
                },
                {
                    model: models.Associate,
                    foreignKey: "associate_id",
                    include: [
                        {
                            model: models.PRU,
                            foreignKey: 'associate_id'
                        },
                        {
                            model: models.associatemanager,
                            foreignKey: 'associate_id'
                        },
                    ]
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
    update: function (req, res) {
        const missionId = req.params.id;
        models.Mission.findOne({
            where: { id: missionId },
        })
            .then(function (mission) {
                if (!mission) {
                    return res.status(404).json({ error: "mission not found" })
                }
                const label = req.body.label || mission.label
                const project =  req.body.project_id
                const tjm = req.body.tjm;
                const start_date = req.body.start_date;
                const end_date = req.body.end_date;
                const other_mission_id = req.body.old_mission_id;
                const other_mission_start = req.body.old_mission_start;
                const other_mission_end = req.body.old_mission_end;
                const other_mission_imputation = req.body.old_mission_imputation;
                const other_mission_label = req.body.old_mission_label;
                const other_mission_project = req.body.old_mission_project;
                const new_mission_imputation = req.body.new_mission_imputation;
                if (mission.start_date != start_date || mission.end_date != end_date) {
                    return mission.update({
                        label: label,
                        start_date: start_date,

                        end_date: end_date,
                    })
                        .then(function (updateMission) {
                            models.TJM.findOne({
                                where: { mission_id: updateMission.id },
                                order: [
                                    ['createdAt', 'DESC'],
                                ],
                                limit: 1,
                            })
                                .then(function (lastTJM) {
                                    if (lastTJM.value != tjm || lastTJM != null) {
                                        // On change la date de fin du précédent par celle aujourd'hui
                                        lastTJM.update({ end_date: today() })
                                        // On créer le nouveau TJM
                                        models.TJM.create({
                                            mission_id: updateMission.id,
                                            start_date: today(),
                                            end_date: updateMission.end_date,
                                        })
                                    }

                                }).then(function () {
                                    models.Imputation.findAll({
                                        where: {
                                            mission_id: updateMission.id
                                        }
                                    }).then(function (other_imputations) {
                                        other_imputations.forEach(function (other_imputation) {
                                            other_imputation.destroy();
                                        })
                                    })
                                })
                                .then(function () {
                                    if (other_mission_id != null) {
                                        models.Imputation.findAll({
                                            where: {
                                                mission_id: other_mission_id
                                            }
                                        }).then(function (other_imputations) {
                                            other_imputations.forEach(function (other_imputation) {
                                                other_imputation.destroy();
                                            })
                                        })
                                            .then(function (other_imputations) {
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
                                })
                                .catch((error) => console.error(error));
                        })
                }
            })
    }
}
