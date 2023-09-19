const models = require("../models");
const { Op, literal } = require("sequelize");
const {
    eachWeekOfInterval,
    getISOWeek,
    startOfWeek,
    endOfWeek,
    format,
} = require("date-fns");
const { forEach } = require("async");

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
        const researchCollab = req.query.search;
        const selected_manager = req.query.manager;
        const selected_customer = req.query.customer;
        const selected_project = req.query.project;

        const weeks = weeksFilter(generateWeekList(selected_year));
        var pdc = [];
        const outWeeks = [];

        models.Associate.findAll({
            order: [['name', 'ASC']],
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

                // Liste générant le pdc
                associates.forEach((associate) => {

                    full_name = associate.first_name + ' ' + associate.name;
                    let projects = []
                    let customers = []
                    let managers = []

                    associate.Missions.forEach((mission) => {
                        projects.push(mission.Project.label);
                        customers.push(mission.Project.Customer.label);
                    })
                    associate.managers.forEach((manager) => {
                        managers.push(manager.first_name + ' ' + manager.name)
                    })

                    var associate_info = {
                        full_name: full_name,
                        projects: projects,
                        customers: customers,
                        managers: managers,
                        start_date: associate.start_date,
                        end_date: associate.end_date,
                        Missions: associate.Missions,
                        weeks: [],
                    };

                    weeks.forEach((week) => {
                        let nbInterContrat = 0;
                        let nbInMission = 0;
                        let horsSII = 0;
                        state = isWorking(associate, week);

                        if (state == 1) {
                            nbInMission++;
                        } else if (state == 2) {
                            nbInterContrat++;
                        } else {
                            horsSII++;
                        }

                        associate_info.weeks.push({
                            weekNumber: 'S' + week.weekNumber,
                            state: state,
                        });
                    });
                    pdc.push(associate_info);

                    // on filtre sur le nom prenom des collabs
                    if (researchCollab) {
                        const searchTerm = researchCollab.toLowerCase();
                        pdc = pdc.filter((associate) => {
                            return associate.full_name.toLowerCase().includes(searchTerm);
                        });
                    }

                    // filtre sur le manager
                    if (selected_manager) {
                        pdc = pdc.filter((associate) =>
                            associate.managers.some((manager) => manager === selected_manager)
                        );
                    }

                    // filtre sur le client
                    if (selected_customer) {
                        pdc = pdc.filter((associate) =>
                            associate.customers.some(
                                (customer) => customer === selected_customer
                            )
                        );
                    }

                    //filtre sur le projet
                    if (selected_project) {
                        pdc = pdc.filter((associate) =>
                            associate.projects.some((project) => project === selected_project)
                        );
                    }

                });

                // Liste pour récupérer le nombre de collaborateurs en contrat ou interco chaque semaine
                weeks.forEach((week) => {
                    let nbInterContrat = 0;
                    let nbInMission = 0;
                    let horsSII = 0;
                    var week_info = {
                        weekNumber: 'S' + week.weekNumber,
                        nbInterContrat,
                        nbInMission,
                        horsSII,
                    };

                    pdc.forEach((associate) => {
                        state = isWorking(associate, week);
                        if (state == 1) {
                            nbInMission++;
                        } else if (state == 2) {
                            nbInterContrat++;
                        } else {
                            horsSII++;
                        }
                    });
 
                    week_info.nbInterContrat = nbInterContrat;
                    week_info.nbInMission = nbInMission;
                    week_info.horsSII = horsSII;

                    outWeeks.push(week_info);
                });
                return res.status(201).json({
                    pdc,
                    outWeeks,
                });

            }).catch((error) => console.error(error));
    },
};