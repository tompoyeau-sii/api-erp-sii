const { forEach } = require("async");
const db = require("../../models").production.models;
const { Op } = require("sequelize");
const {
    format, addDays, isAfter, parseISO
} = require("date-fns");

function today(offset = 0) {
    let date = new Date();
    if (offset !== 0) {
        date = addDays(date, offset);
    }
    return format(date, 'yyyy-MM-dd');
}

// Fonction pour créer la timeline
async function createTimeline(startDate, endDate, missions, associate_id) {
    const timeline = [];
    let currentDate = new Date(startDate);
    let endDateObj = new Date(endDate);
    let prevImputation = null;
    let intervalStart = null;

    await db.Timeline.destroy({
        where: {
            associate_id: associate_id
        }
    }).catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Problème lors de la création de la timeline" });
    })

    while (currentDate <= endDateObj) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        const imputation = calculateImputationPercentage(formattedDate, missions);

        // Si le pourcentage d'imputation est différent du précédent
        if (imputation != prevImputation) {

            // Si ce n'est pas le premier intervalle, enregistrer l'intervalle précédent
            if (prevImputation != null) {
                await db.Timeline.create({
                    associate_id: associate_id,
                    date_range: [intervalStart, formattedDate],
                    imputation_percentage: prevImputation,
                });
            }
            // Début du nouvel intervalle
            intervalStart = formattedDate;
        }

        prevImputation = imputation;

        // Incrémenter la date d'un jour
        currentDate = addDays(currentDate, 1);
    }

    // Enregistrer le dernier intervalle
    if (prevImputation !== null) {
        await db.Timeline.create({
            associate_id: associate_id,
            date_range: [intervalStart, endDate],
            imputation_percentage: prevImputation,
        });
    }

    return timeline;
}

// Fonction pour calculer le pourcentage d'imputation pour une journée donnée
function calculateImputationPercentage(date, missions) {
    let missionCount = 0;

    // Parcourir chaque mission et vérifier si la date est incluse dans la plage de dates de la mission
    missions.forEach((mission) => {
        const startDate = format(new Date(mission.dataValues.date_range_mission[0].value), 'yyyy-MM-dd');
        const endDate = format(new Date(mission.dataValues.date_range_mission[1].value), 'yyyy-MM-dd');

        if (date >= startDate && date <= endDate) {
            missionCount++;
        }
    });

    // Calculer le pourcentage d'imputation
    return missionCount > 0 ? 100 / missionCount : 0;
}

module.exports = {

    create: async function (req, res) {
        const label = req.body.label; // label de la mission
        const associate_id = req.body.associate_id; // collab concerné par la mission
        const project_id = req.body.project_id; // project concerné par la mission
        const tjm = req.body.tjm; // tjm de la mission
        const start_date = req.body.start_date; // date de début de la nouvelle mission
        const end_date = req.body.end_date; // date de fin de la nouvelle mission

        // Vérification si les paramètres sont bien complets
        if (!label || !associate_id || !project_id || !tjm || !start_date) {
            return res.status(400).json({ error: "Veuillez complétez tous les champs." });
        }

        // On recherche le collaborateur
        try {
            const associateFound = await db.Associate.findOne({
                where: {
                    id: associate_id
                }
            });

            // Vérifier si le collaborateur existe
            if (!associateFound) {
                return res.status(404).json({ error: "Collaborateur non trouvé" });
            }

            // Créer la mission
            const mission = await db.Mission.create({
                label: label,
                associate_id: associate_id,
                project_id: project_id,
                date_range_mission: [
                    { value: start_date, inclusive: true },
                    { value: end_date, inclusive: true },
                ],
                imputation_value: 100,
            }).catch((error) => {
                console.error(error)
                return res.status(500).json({ error: "Problème lors de la création de la mission" });
            });

            // Créer le TJM
            await db.TJM.create({
                mission_id: mission.id,
                start_date: mission.date_range_mission[0].value,
                end_date: mission.date_range_mission[1].value,
                value: tjm,
            }).catch((error) => {
                console.log(error)
                return res.status(500).json({ error: "Problème lors de la création du TJM" });
            });

            // Récupérer toutes les missions associées au collaborateur
            db.Mission.findAll({
                where: {
                    associate_id: associate_id,
                },
            }).then((missions) => {
                db.Mission.findOne({
                    where: {
                        associate_id: associate_id,
                        project_id: project_id,
                    },
                    order: [['date_range_mission', 'DESC']], // Ordre décroissant pour obtenir la dernière mission en premier
                }).then((lastMission) => {
                    // Utiliser la date de fin la plus lointaine comme date de fin pour la timeline
                    const timelineEndDate = associateFound.end_date || lastMission.date_range_mission[1].value;
                    // Création de la timeline
                    const timeline = createTimeline(associateFound.start_date, timelineEndDate, missions, associateFound.id);
                    return res.status(201).json({ missionId: mission.id, timeline: timeline });
                })
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Problème lors de la création de la mission" });
        }
    },
    findAll: function (req, res) {
        db.Mission.findAll({
            include: [
                {
                    model: db.TJM,
                    foreignKey: "mission_id"
                },
                {
                    model: db.Project,
                    foreignKey: "project_id",
                },
                {
                    model: db.Associate,
                    foreignKey: "associate_id",
                    include: [
                        {
                            model: db.PRU,
                            foreignKey: 'associate_id'
                        },
                        {
                            model: db.Associate, // Utilisez le modèle Associate ici
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
    update: async function (req, res) {
        const mission_id = req.params.id;
        const tjm_value = req.body.tjm; // tjm de la mission
        const tjm_start_date = req.body.tjm_start_date
        const start_date = req.body.start_date; // date de début de la nouvelle mission
        const end_date = req.body.end_date;

        if (!mission_id || !tjm_value || !start_date || !end_date) {
            return res.status(500).json({ error: "Remplissez tous les champs." });
        }

        try {
            // Recherche de la mission existante
            let mission = await db.Mission.findOne({
                where: {
                    id: mission_id
                },
            });
            let LastTJM = await db.TJM.findOne({
                where: {
                    mission_id: mission_id
                },
                order: [['createdAt', 'DESC']]
            });

            // Si la mission existe déjà, mettre à jour les champs fournis dans la requête
            if (mission) {
                if (start_date != mission.date_range_mission[0].value) {
                    mission = await mission.update({
                        date_range_mission: [
                            { value: start_date, inclusive: true },
                            { value: mission.date_range_mission[1].value, inclusive: false },
                        ],
                    }).catch((error) => {
                        console.error(error)
                        return res.status(500).json({ error: "Erreur lors de la modification de la date de début de la mission." });
                    })

                    if (tjm_value == LastTJM.value) {

                        db.TJM.findOne({
                            where: {
                                mission_id: mission.id,
                            },
                            order: [['createdAt', 'ASC']]
                        }).then((firstTjm) => {
                            firstTjm.update({
                                start_date: start_date
                            })
                        })
                            .catch((error) => {
                                console.error(error)
                                return res.status(500).json({ error: "Erreur lors de la modification de la date de début du TJM." });
                            })
                    }
                }

                if (end_date != mission.date_range_mission[1].value) {
                    mission = await mission.update({
                        date_range_mission: [
                            { value: mission.date_range_mission[0].value, inclusive: true },
                            { value: end_date, inclusive: false },
                        ],
                    }).catch((error) => {
                        console.error(error)
                        return res.status(500).json({ error: "Erreur lors de la modification de la date de fin de la mission." });
                    })

                    if (tjm_value == LastTJM.value) {
                        await db.TJM.update({
                            end_date: end_date,
                        }, {
                            where: {
                                mission_id: mission.id,
                            },
                            order: [['createdAt', 'DESC']]
                        }).catch((error) => {
                            console.error(error)
                            return res.status(500).json({ error: "Erreur lors de la modification de la date de fin du TJM." });
                        })
                    }
                }

                // Si le TJM a été fourni, mettre à jour le TJM associé à la mission
                if (tjm_value != LastTJM.value) {
                    let tjm_start;
                    if (tjm_start_date) {
                        tjm_start = tjm_start_date
                    } else {
                        // Obtenir la date actuelle
                        const currentDate = new Date();
                        // Formater la date actuelle en "YYYY-MM-DD"
                        tjm_start = format(currentDate, 'yyyy-MM-dd');
                    }


                    await db.TJM.update({
                        end_date: tjm_start
                    }, {
                        where: {
                            mission_id: mission.id,
                        },
                        order: [['createdAt', 'DESC']]

                    }).then((tjm) => {
                        db.TJM.create({
                            mission_id: mission_id,
                            start_date: tjm_start,
                            end_date: end_date,
                            value: tjm_value
                        }).catch((error) => {
                            console.error(error)
                            return res.status(500).json({ error: "Erreur lors de la modification de la valeur du TJM." });
                        })
                    }).catch((error) => {
                        console.error(error)
                        return res.status(500).json({ error: "Erreur lors de la modification de la valeur du TJM." });
                    })
                }
            } else {
                //Mission pas trouvée
                return res.status(500).json({ error: "Pas de mission trouvé" });
            }

            // Récupération des missions associées au collaborateur
            const missions = await db.Mission.findAll({
                where: {
                    associate_id: mission.associate_id,
                },
            });

            // Récupération de la date de fin la plus lointaine pour la timeline
            const associate = await db.Associate.findByPk(mission.associate_id);
            const timelineEndDate = associate.end_date || missions.reduce((maxDate, mission) => {
                const missionEndDate = new Date(mission.date_range_mission[1].value);
                return missionEndDate > maxDate ? missionEndDate : maxDate;
            }, new Date(start_date));

            // Création de la timeline
            const timeline = await createTimeline(associate.start_date, timelineEndDate, missions, mission.associate_id);

            return res.status(201).json({ missionId: mission.id, timeline: timeline });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Problème lors de la création ou de la mise à jour de la mission" });
        }


    }
}
