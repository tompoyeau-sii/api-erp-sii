const db = require("../../models").loison.models;
const { Op, literal } = require("sequelize");
const {
    eachWeekOfInterval,
    getISOWeek,
    getISOMonth,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addMonths,
    format,
    parseISO,
} = require("date-fns");
const { fr } = require('date-fns/locale');

function today(offset = 0) {
    let date = new Date();
    if (offset !== 0) {
        date = addDays(date, offset);
    }
    return format(date, 'yyyy-MM-dd');
}
//Permet de déterminer l'état (en mission, en intercontrat ou hors sii) d'un collaborateur
function isWorking(associate, week) {
    // la personne n'est pas chez sii
    if (associate.start_date >= week.endDate || associate.end_date <= week.startDate) {
        return 3;
    }

    // la personne est en mission
    for (let mission of associate.Missions) {
        if (
            mission.date_range_mission[0].value < week.endDate &&
            mission.date_range_mission[1].value > week.startDate
        ) {
            return 1;
        }
    }

    // la personne est en intercontrat
    return 2;
}

// Génére la liste des semaines dans l'année passé en paramètre et de l'année +1 
function generateWeekList(year) {
    const startDate = new Date(year, 0, 1); // Premier jour de l'année
    const endDate = new Date(year + 1, 11, 31); // Dernier jour de l'année

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

// Génère la liste des mois dans l'année passée en paramètre et l'année +1
function generateMonthList(year) {
    const startDate = new Date(year, 3, 1); // 1er avril de l'année
    const endDate = addMonths(startDate, 11); // 31 mars de l'année suivante

    const allMonths = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        allMonths.push(currentDate);
        currentDate = addMonths(currentDate, 1);
    }

    const monthList = allMonths.map((date) => {
        return {
            monthNumber: date.getMonth() + 1,
            monthName: format(date, 'LLL', { locale: fr }),
            year: date.getFullYear(),
            startDate: format(startOfMonth(date), "yyyy-MM-dd"),
            endDate: format(endOfMonth(date), "yyyy-MM-dd"),
        };
    });
    return monthList;
}

// Modifie la liste générée par la méthode generateMonthList pour que la liste commence en avril (mois 4) et finisse en mars (mois 3) de l'année N+1
function monthsFilter(months) {
    return months.filter(month => month.monthNumber >= 4 || month.monthNumber <= 3);
}


module.exports = {
    createPDCByWeeks: function (req, res) {
        const selected_year = parseInt(req.query.year);
        const researchCollab = req.query.search;
        const selected_manager = req.query.manager;
        const selected_customer = req.query.customer;
        const selected_project = req.query.project;

        const weeks = weeksFilter(generateWeekList(selected_year));
        var pdc = [];
        const outWeeks = [];

        db.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: db.Associate, // Utilisez le modèle Associate ici
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
                    model: db.Mission,
                    foreignKey: 'associate_id',
                    include: [
                        {
                            model: db.Project,
                            foreignKey: 'project_id',
                            include: [
                                {
                                    model: db.Customer,
                                    foreignKey: 'customer_id',
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Job,
                    foreignKey: 'job_id',
                    attributes: ['label'],
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
                    let isManager = false;

                    associate.Jobs.forEach(job => {
                        if (job.label == "Manager") {
                            isManager = true;
                        }
                    })

                    if (!isManager) {

                        associate.Missions.forEach((mission) => {
                            if (mission.date_range_mission[0].value <= today() &&
                                mission.date_range_mission[1].value >= today()) {
                                projects.push(mission.Project.label);
                                customers.push(mission.Project.Customer.label);
                            }
                        })
                        associate.managers.forEach((manager) => {
                            managers.push(manager.first_name + ' ' + manager.name)
                        })

                        var associate_info = {
                            id: associate.id,
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
                    }
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
                    let currentWeek = false;

                    const weekNumber = getISOWeek(parseISO(today()));
                    if (weekNumber == week.weekNumber) {
                        currentWeek = true;
                    }

                    var week_info = {
                        weekNumber: 'S' + week.weekNumber,
                        nbInterContrat,
                        nbInMission,
                        horsSII,
                        currentWeek,
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
    createPDCByMonths: function (req, res) {
        const selected_year = parseInt(req.query.year);
        const researchCollab = req.query.search;
        const selected_manager = req.query.manager;
        const selected_customer = req.query.customer;
        const selected_project = req.query.project;

        const weeks = monthsFilter(generateMonthList(selected_year));
        var pdc = [];
        const outWeeks = [];

        db.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: db.Associate, // Utilisez le modèle Associate ici
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
                    model: db.Mission,
                    foreignKey: 'associate_id',
                    include: [
                        {
                            model: db.Project,
                            foreignKey: 'project_id',
                            include: [
                                {
                                    model: db.Customer,
                                    foreignKey: 'customer_id',
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Job,
                    foreignKey: 'job_id',
                    attributes: ['label'],
                },
                {
                    model: db.WorkedDays,
                    foreignKey: 'associate_id',
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
                    let isManager = false;

                    associate.Jobs.forEach(job => {
                        if (job.label == "Manager") {
                            isManager = true;
                        }
                    })

                    if (!isManager) {
                        associate.Missions.forEach((mission) => {
                            if (mission.date_range_mission[0].value <= today() &&
                                mission.date_range_mission[1].value >= today()) {
                                projects.push(mission.Project.label);
                                customers.push(mission.Project.Customer.label);
                            }
                        })
                        associate.managers.forEach((manager) => {
                            managers.push(manager.first_name + ' ' + manager.name)
                        })

                        var associate_info = {
                            id: associate.id,
                            full_name: full_name,
                            projects: projects,
                            customers: customers,
                            managers: managers,
                            start_date: associate.start_date,
                            end_date: associate.end_date,
                            Missions: associate.Missions,
                            weeks: [],
                            nb_day: null,
                        };

                        weeks.forEach((week) => {
                            let nbInterContrat = 0;
                            let nbInMission = 0;
                            let horsSII = 0;
                            let nb_day = null;
                            state = isWorking(associate, week);

                            if (state == 1) {
                                nbInMission++;
                            } else if (state == 2) {
                                nbInterContrat++;
                            } else {
                                horsSII++;
                            }
                            associate.WorkedDays.forEach((days) => {
                                if (days.month_date == week.startDate) {
                                    nb_day = days.nb_day;
                                }
                            });

                            associate_info.weeks.push({
                                weekNumber: week.monthName,
                                nb_day: nb_day,
                                state: state,
                            });
                        });
                        pdc.push(associate_info);
                    }
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
                    let currentWeek = false;

                    const weekNumber = getISOWeek(parseISO(today()));
                    if (weekNumber == week.weekNumber) {
                        currentWeek = true;
                    }

                    var week_info = {
                        weekNumber: week.monthName,
                        nbInterContrat,
                        nbInMission,
                        horsSII,
                        currentWeek,
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
    getPdcYear: function (req, res) {
        db.Pdc.findOne().then((pdc) => {
            return res.status(201).json({
                pdc,
            });
        }).catch((err) => {
            console.error(err)
            return res.status(400).json({ error: "Erreur lors de la modification de l'année." });
        })
    },
    updatePDCYear: function (req, res) {
        const year = parseInt(req.body.year);
        db.Pdc.findOne().then((pdc) => {
            if (pdc) {
                pdc.update({
                    actual_year: year
                }).then((newYear) => {
                    return res.status(201).json({ message: "Modification de l'année réussi." });
                }).catch((err) => {
                    console.error(err)
                    return res.status(400).json({ error: "Erreur lors de la modification de l'année." });
                })
            } else {
                db.Pdc.create({
                    actual_year: year
                }).then((newYear) => {
                    return res.status(201).json({ message: "Modification de l'année réussi." });
                }).catch((err) => {
                    console.error(err)
                    return res.status(400).json({ error: "Erreur lors de la modification de l'année." });
                })
            }
        })
    }
};