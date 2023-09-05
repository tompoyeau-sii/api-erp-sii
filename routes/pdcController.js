const models = require("../models");
const { Op, literal } = require("sequelize");
const {
    eachWeekOfInterval,
    getISOWeek,
    startOfWeek,
    endOfWeek,
    format,
} = require("date-fns");

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
//Permet de déterminer l'état (en mission, en intercontrat ou hors sii) d'un collaborateur
function isWorking(associate, year) {
    // la personne n'est pas chez sii
    if (
        associate.start_date >= year.endDate || associate.end_date <= year.startDate
    ) {
        return 3;
    }
    // la personne est en mission
    for (let mission of associate.Missions) {
        if (
            mission.start_date < year.endDate &&
            mission.end_date > year.startDate
        ) {
            return 1;
        }
        else {
            // la personne est en intercontrat
            return 2;
        }
    }

    if (associate.Missions.length == 0) {
        return 2;
    }

};
// Génére la liste des semaines dans l'année passé en paramètre et de l'année +1 
function generateWeekList(year) {
    const startDate = new Date(year, 0, 1); // Premier jour de l'année
    const endDate = new Date(year + 1, 11, 31); // Dernier jour de l'année

    console.log(startDate)
    console.log(endDate)

    const allWeeks = eachWeekOfInterval({
        start: startDate,
        end: endDate,
        weekStartsOn: 1,
    });
    const weekList = allWeeks.map((date) => {
        const weekNumber = getISOWeek(date);
        const startDateOfWeek = startOfWeek(date, { weekStartsOn: 1 });
        const endDateOfWeek = endOfWeek(date, { weekStartsOn: 1 });
        return {
            weekNumber,
            startDate: format(startDateOfWeek, "yyyy-MM-dd"),
            endDate: format(endDateOfWeek, "yyyy-MM-dd"),
        };
    });
    return weekList;
};
// Modifie la liste générer par la méthode generateWeekList pour que la liste commence en S14 et finissent en S13
function weeksFilter(weeks) {
    let weeksFiltered = [];
    let i = 0;
    let tour = false;
    weeks.forEach((week) => {
        i++;
        if (i > 14 && !tour) {
            weeksFiltered.push(week);
        } else if (i < 14 && tour == true) {
            weeksFiltered.push(week);
        }
        if (i == 53) {
            i = 0;
            tour = true;
        }
    });
    return weeksFiltered;
};

module.exports = {
    createPDC: function (req, res) {
        const selected_year = parseInt(req.query.year);
        const collab = req.query.collab;
        const customer = parseInt(req.query.customer);
        const project = parseInt(req.query.project);

        const weeks = weeksFilter(generateWeekList(selected_year));
        const pdc = [];
        const whereClause = {};

        if (!isNaN(selected_year)) {
            whereClause.year = selected_year;
        }

        if (collab) {
            whereClause.collab = collab;
        }

        if (!isNaN(customer)) {
            whereClause.customer = customer;
        }

        if (!isNaN(project)) {
            whereClause.project = project;
        }

        models.Associate.findAll({
            order: [['name', 'ASC']],
            where: {
                [Op.and]: [
                    whereClause.collab ? {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.substring]: whereClause.collab,
                                }
                            },
                            {
                                first_name: {
                                    [Op.substring]: whereClause.collab,
                                }
                            }
                        ]
                    } : {}, // Filtre sur le nom ou le prénom uniquement si collab n'est pas vide
                ]
            },
            include: [
                {
                    model: models.Associate, // Utilisez le modèle Associate ici
                    as: 'managers',          // Utilisez le nom de la relation défini dans le modèle Associate
                    through: {
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
                        attributes: ['start_date', 'end_date'], // Incluez les colonnes de la table de liaison
                    },
                },
                {
                    model: models.Job,
                    foreignKey: 'job_id',
                    attributes: ['label'],
                },
                {
                    model: models.Mission,
                    foreignKey: 'associate_id',
                    include: [
                        {
                            model: models.Project,
                            foreignKey: 'project_id',
                            include: [
                                {
                                    model: models.Customer,
                                    foreignKey: 'customer_id',
                                },
                            ],
                        },
                    ],
                },
            ],
        })
            .then((associates) => {

                weeks.forEach((week) => {
                    let nbInterContrat = 0;
                    let nbInMission = 0;
                    let horsSII = 0;
                    var week_info = {
                        weekNumber: 'S' + week.weekNumber,
                        associates: [],
                        nbInterContrat,
                        nbInMission,
                        horsSII,
                    };

                    associates.forEach((associate) => {
                        state = isWorking(associate, week);
                        if (state == 1) {
                            nbInMission++;
                        } else if (state == 2) {
                            nbInterContrat++;
                        } else {
                            horsSII++;
                        }
                        full_name = associate.first_name + ' ' + associate.name
                        week_info.associates.push({
                            full_name: full_name,
                            state: state
                        });
                    });

                    week_info.nbInterContrat = nbInterContrat;
                    week_info.nbInMission = nbInMission;
                    week_info.horsSII = horsSII;

                    pdc.push(week_info);
                });

                return res.status(201).json({
                    pdc
                });

            }).catch((error) => console.error(error));
    },
};