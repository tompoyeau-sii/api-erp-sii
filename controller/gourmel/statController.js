const db = require("../../models").gourmel.models;
const {
    startOfMonth,
    endOfMonth,
    eachMonthOfInterval,
    format,
    getYear,
    getMonth,
    eachDayOfInterval,
    isWeekend
} = require("date-fns");
const { Op } = require("sequelize");
const { fr } = require("date-fns/locale");

function getWorkingDaysInMonth(year, month) {
    // Attendre que getOffDays ait fini son traitement avant de continuer

    let startDate = new Date(year, month, 1);
    let endDate = new Date(year, month + 1, 0);

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    const workingDays = allDays.filter((day) => !isWeekend(day));

    let nbJours = workingDays.length;

    return nbJours;
}
//Génére la liste des mois de l'année passée en paramètre allant de S14 à S13
function generateMonthList(year) {
    const list_start = startOfMonth(new Date(year, 3, 1));
    const list_end = startOfMonth(new Date(year + 1, 2, 1));
    console.log(list_start);
    console.log(list_end);
    const monthsList = eachMonthOfInterval({
        start: list_start,
        end: list_end,
        monthStartsOn: 1,
    });

    const allMonths = monthsList.map((date) => {
        const month = format(date, "MMMM", { locale: fr });
        const startDateOfMonth = startOfMonth(date, { weekStartsOn: 1 });
        const endDateOfMonth = endOfMonth(date, { weekEndsOn: 1 });

        let nbDay = getWorkingDaysInMonth(
            getYear(startDateOfMonth),
            getMonth(startDateOfMonth)
        );

        // console.log(format(startDateOfMonth, "yyyy-MM-dd") + ' : ' + nbDay)

        return {
            monthNumber: month,
            start_date: format(startDateOfMonth, "yyyy-MM-dd"),
            end_date: format(endDateOfMonth, "yyyy-MM-dd"),
            nb_day: nbDay,
        };
    });
    // console.log(allMonths)
    return allMonths;
}

function todayYYMMAAAA() {
    return format(new Date(), "yyyy-MM-dd");
}

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
    calculateStatsManager: function (req, res) {
        if (!req.query.year) {
            return res.status(400).json({ 'error': "L'année est manquante" });
        }
        db.Job.findAll({
            where: { label: "Manager" },
            include:
            {
                model: db.Associate,
                include:
                    [
                        {
                            model: db.PRU,
                            foreignKey: 'associate_id'
                        },
                        {
                            model: db.Associate,
                            as: 'associates',
                            foreignKey: 'manager_id',
                            include:
                                [
                                    {
                                        model: db.PRU,
                                        foreignKey: 'associate_id',
                                    },
                                    {
                                        model: db.Timeline,
                                        foreignKey: 'associate_id',
                                    },

                                    {
                                        model: db.Mission,
                                        foreignKey: 'project_id',
                                        include: [
                                            {
                                                model: db.Associate,
                                                foreignKey: 'associate_id',
                                                include: {
                                                    model: db.PRU,
                                                    foreignKey: 'associate_id'
                                                }
                                            },
                                            {
                                                model: db.TJM,
                                                foreignKey: 'mission_id'
                                            },
                                        ]
                                    }
                                ]
                        },
                    ]
            }
        }).then((managers) => {
            const year = parseInt(req.query.year);
            const manager_id = parseInt(req.query.manager);
            let ca = []
            let value = 0;
            const months = generateMonthList(year)

            managers.forEach((job) => {
                job.Associates.forEach((manager) => {
                    if (manager.id == manager_id) {
                        months.forEach((month) => {
                            let marge = 0;
                            manager.PRUs.forEach((PRU) => {
                                if (
                                    format(PRU.start_date, "yyyy-MM-dd") <= month.end_date && // Vérifie si la date de début du PRU est antérieure ou égale à la date de fin du mois
                                    format(PRU.end_date, "yyyy-MM-dd") >= month.start_date // Vérifie si la date de fin du PRU est postérieure ou égale à la date de début du mois
                                ) {
                                    value -= PRU.value * month.nb_day;
                                    marge -= PRU.value * month.nb_day;
                                }
                            });
                            manager.associates.forEach((collab) => {
                                collab.Missions.forEach((mission) => {
                                    // Si la mission commence avant et fini après le mois en cours
                                    if (
                                        mission.date_range_mission[0].value <= month.start_date &&
                                        mission.date_range_mission[1].value >= month.end_date
                                    ) {
                                        mission.TJMs.forEach((TJM) => {
                                            if (
                                                TJM.start_date <= month.start_date &&
                                                TJM.end_date >= month.end_date
                                            ) {
                                                value += TJM.value * month.nb_day;
                                                marge += TJM.value * month.nb_day;
                                            }
                                        });

                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(PRU.start_date, "yyyy-MM-dd") <= month.start_date &&
                                                format(PRU.end_date, "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                value -= PRU.value * month.nb_day;
                                                marge -= PRU.value * month.nb_day;
                                            }
                                        });

                                        //Si la mission commence pendant le mois en cours
                                    } else if (
                                        mission.date_range_mission[0].value >= month.start_date &&
                                        mission.date_range_mission[0].value < month.end_date
                                    ) {
                                        mission.TJMs.forEach((TJM) => {
                                            if (
                                                TJM.start_date <= month.start_date &&
                                                TJM.end_date >= month.end_date
                                            ) {
                                                value += TJM.value * month.nb_day;
                                                marge += TJM.value * month.nb_day;
                                            } else if (
                                                TJM.start_date >= month.start_date &&
                                                TJM.start_date < month.end_date
                                            ) {
                                                value += TJM.value * month.nb_day;
                                                marge += TJM.value * month.nb_day;
                                            }
                                        });
                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(PRU.start_date, "yyyy-MM-dd") <= month.start_date &&
                                                format(PRU.end_date, "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                value -= PRU.value * month.nb_day;
                                                marge -= PRU.value * month.nb_day;
                                            } else if (
                                                format(PRU.start_date, "yyyy-MM-dd") >= month.start_date &&
                                                format(PRU.start_date, "yyyy-MM-dd") < month.end_date
                                            ) {
                                                value -= PRU.value * month.nb_day;
                                                marge -= PRU.value * month.nb_day;
                                            }
                                        });

                                        //Si la mission termine pendant le mois en cours
                                    } else if (
                                        mission.date_range_mission[1].value >= month.start_date &&
                                        mission.date_range_mission[1].value <= month.end_date
                                    ) {
                                        mission.TJMs.forEach((TJM) => {
                                            if (
                                                TJM.start_date <= month.start_date &&
                                                TJM.end_date >= month.end_date
                                            ) {
                                                value += TJM.value * month.nb_day;
                                                marge += TJM.value * month.nb_day;
                                            } else if (
                                                TJM.end_date >= month.start_date &&
                                                TJM.end_date < month.end_date
                                            ) {
                                                value += TJM.value * month.nb_day;
                                                marge += TJM.value * month.nb_day;
                                            }
                                        });
                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(PRU.start_date, "yyyy-MM-dd") <= month.start_date &&
                                                format(PRU.end_date, "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                value -= PRU.value * month.nb_day;
                                                marge -= PRU.value * month.nb_day;
                                            } else if (
                                                format(PRU.end_date, "yyyy-MM-dd") >= month.start_date &&
                                                format(PRU.end_date, "yyyy-MM-dd") < month.end_date
                                            ) {
                                                value -= PRU.value * month.nb_day;
                                                marge -= PRU.value * month.nb_day;
                                            }
                                        });
                                    }
                                })
                            });
                            ca.push({ month: month.monthNumber, value: value, marge: marge });
                        });
                    }
                });
            });
            return res.status(201).json({
                ca,
            });
        })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ 'error': "Erreur lors du calcul du chiffre d'affaire manager" });
            });

    },
    calculateStatsAgence: function (req, res) {
        if (!req.query.year) {
            return res.status(400).json({ 'error': "L'année est manquante" });
        }
        db.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: db.PRU,
                    foreignKey: 'associate_id',
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
                        {
                            model: db.TJM,
                            foreignKey: 'mission_id'
                        }
                    ],
                },
            ],
        })
            .then((associate) => {
                const year = parseInt(req.query.year);
                console.log("calculateStatsAgence");
                const months = generateMonthList(year)
                let ca = 0;
                caForMonths = [];
                months.forEach((month) => {
                    associate.forEach((associate) => {
                        associate.PRUs.forEach((PRU) => {
                            if (
                                format(PRU.start_date, "yyyy-MM-dd") <= month.start_date &&
                                format(PRU.end_date, "yyyy-MM-dd") >= month.end_date
                            ) {

                                ca -= PRU.value * month.nb_day;
                            } else if (
                                format(PRU.start_date, "yyyy-MM-dd") >= month.start_date &&
                                format(PRU.start_date, "yyyy-MM-dd") <= month.end_date
                            ) {
                                ca -= PRU.value * month.nb_day;
                            } else if (
                                format(PRU.end_date, "yyyy-MM-dd") >= month.start_date &&
                                format(PRU.end_date, "yyyy-MM-dd") <= month.end_date
                            ) {
                                ca -= PRU.value * month.nb_day;
                            }
                        });
                        associate.Missions.forEach((mission) => {
                            mission.TJMs.forEach((tjm) => {
                                if (
                                    tjm.start_date <= month.start_date &&
                                    tjm.end_date >= month.end_date
                                ) {
                                    ca += tjm.value * month.nb_day;
                                } else if (
                                    tjm.start_date >= month.start_date &&
                                    tjm.start_date <= month.end_date
                                ) {
                                    ca += tjm.value * month.nb_day;
                                } else if (
                                    tjm.end_date >= month.start_date &&
                                    tjm.end_date <= month.end_date
                                ) {
                                    ca += tjm.value * month.nb_day;
                                }
                            });
                        });
                    });
                    caForMonths.push({ month: month.monthNumber, value: ca, start_month: month.start_date, end_month: month.end_date });
                });
                return res.status(201).json({
                    caForMonths,
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ 'error': "Erreur lors du calcul du chiffre d'affaire de l'agence" });
            });

    },
    calculateStatsCustomer: function (req, res) {
        if (!req.query.year) {
            return res.status(400).json({ 'error': "L'année est manquante" });
        }
        db.Customer.findOne({
            where: {
                id: parseInt(req.query.customer)
            },
            include: [
                {
                    model: db.Project,
                    foreignKey: "customer_id",
                    include: [
                        {
                            model: db.Mission,
                            foreignKey: 'project_id',
                            where: {
                                date_range_mission: {
                                    [Op.contains]: [today(), today()]
                                },
                            },
                            include: [
                                {
                                    model: db.Associate,
                                    foreignKey: "associate_id",
                                    include:
                                    {
                                        model: db.PRU,
                                        foreignKey: "associate_id"
                                    }
                                },

                                {
                                    model: db.TJM,
                                    foreignKey: "mission_id"
                                },
                            ],
                            group: 'associate_id'
                        }
                    ]
                }
            ]
        })
            .then((customer) => {
                let ca = 0;
                let caOfCustomer = [];
                const year = parseInt(req.query.year);
                console.log("calculateStatsCustomer");
                const months = generateMonthList(year)
                months.forEach((month) => {
                    customer.Projects.forEach((project) => {
                        project.Missions.forEach((mission) => {
                            //Si la mission commence avant et fini après le mois
                            if (
                                mission.date_range_mission[0].value <= month.start_date &&
                                mission.date_range_mission[1].value >= month.end_date
                            ) {
                                mission.TJMs.forEach((tjm) => {
                                    if (
                                        tjm.start_date <= month.start_date &&
                                        tjm.end_date >= month.end_date
                                    ) {
                                        ca += tjm.value * month.nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                        format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * month.nb_day;
                                    }
                                });
                                //Si la mission commence pendant le mois et fini après
                            } else if (
                                mission.date_range_mission[0].value >= month.start_date &&
                                mission.date_range_mission[0].value < month.end_date
                            ) {
                                mission.TJMs.forEach((TJM) => {
                                    if (
                                        TJM.start_date <= month.start_date &&
                                        TJM.end_date >= month.end_date
                                    ) {
                                        ca += TJM.value * month.nb_day;
                                    } else if (
                                        TJM.start_date >= month.start_date &&
                                        TJM.start_date < month.end_date
                                    ) {
                                        ca += TJM.value * month.nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                        format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * month.nb_day;
                                    } else if (
                                        format(pru.start_date, "yyyy-MM-dd") >= month.start_date &&
                                        format(pru.end_date, "yyyy-MM-dd") < month.end_date
                                    ) {
                                        ca -= pru.value * month.nb_day;
                                    }
                                });
                                //Si la mission termine pendant le mois en cours
                            } else if (
                                mission.date_range_mission[1].value >= month.start_date &&
                                mission.date_range_mission[1].value <= month.end_date
                            ) {
                                mission.TJMs.forEach((TJM) => {
                                    if (
                                        TJM.start_date <= month.start_date &&
                                        TJM.end_date >= month.end_date
                                    ) {
                                        ca += TJM.value * month.nb_day;
                                    } else if (
                                        TJM.end_date >= month.start_date &&
                                        TJM.end_date < month.end_date
                                    ) {
                                        ca += TJM.value * month.nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                        format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * month.nb_day;
                                    } else if (
                                        format(pru.start_date, "yyyy-MM-dd") >= month.start_date &&
                                        format(pru.end_date, "yyyy-MM-dd") < month.end_date
                                    ) {
                                        ca -= pru.value * month.nb_day;
                                    }
                                });
                            }
                        });
                    });
                    caOfCustomer.push({ month: month.monthNumber, value: ca, start_month: month.start_date, end_month: month.end_date });
                });

                return res.status(201).json({
                    caOfCustomer,
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ 'error': "Erreur lors du calcul du chiffre d'affaire client" });
            });
    },
    calculateStatsCustomerActualMonth: function (req, res) {

        if (!req.query.year) {
            return res.status(400).json({ 'error': "L'année est manquante" });
        }
        
        db.Customer.findAll({
            include: [
                {
                    model: db.Project,
                    foreignKey: "customer_id",
                    include: [
                        {
                            model: db.Mission,
                            foreignKey: 'project_id',
                            where: {
                                date_range_mission: {
                                    [Op.contains]: [today(), today()]
                                },
                            },
                            include: [
                                {
                                    model: db.Associate,
                                    foreignKey: "associate_id",
                                    include:
                                    {
                                        model: db.PRU,
                                        foreignKey: "associate_id"
                                    }
                                },

                                {
                                    model: db.TJM,
                                    foreignKey: "mission_id"
                                },
                            ],
                            group: 'associate_id'
                        }
                    ]
                }
            ]
        })
            .then((customers) => {
                let caGlobalCustomers = [];
                const year = parseInt(req.query.year);
                const months = generateMonthList(year)
                customers.forEach((customer) => {
                    let ca = 0;
                    let caOfCustomer = [];
                    months.forEach((month) => {
                        customer.Projects.forEach((project) => {
                            project.Missions.forEach((mission) => {
                                //Si la mission commence avant et fini après le mois
                                if (
                                    mission.date_range_mission[0].value <= month.start_date &&
                                    mission.date_range_mission[1].value >= month.end_date
                                ) {
                                    mission.TJMs.forEach((tjm) => {
                                        if (
                                            tjm.start_date <= month.start_date &&
                                            tjm.end_date >= month.end_date
                                        ) {
                                            ca += tjm.value * month.nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * month.nb_day;
                                        }
                                    });
                                    //Si la mission commence pendant le mois et fini après
                                } else if (
                                    mission.date_range_mission[0].value >= month.start_date &&
                                    mission.date_range_mission[0].value < month.end_date
                                ) {
                                    mission.TJMs.forEach((TJM) => {
                                        if (
                                            TJM.start_date <= month.start_date &&
                                            TJM.end_date >= month.end_date
                                        ) {
                                            ca += TJM.value * month.nb_day;
                                        } else if (
                                            TJM.start_date >= month.start_date &&
                                            TJM.start_date < month.end_date
                                        ) {
                                            ca += TJM.value * month.nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * month.nb_day;
                                        } else if (
                                            format(pru.start_date, "yyyy-MM-dd") >= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") < month.end_date
                                        ) {
                                            ca -= pru.value * month.nb_day;
                                        }
                                    });
                                    //Si la mission termine pendant le mois en cours
                                } else if (
                                    mission.date_range_mission[1].value >= month.start_date &&
                                    mission.date_range_mission[1].value <= month.end_date
                                ) {
                                    mission.TJMs.forEach((TJM) => {
                                        if (
                                            TJM.start_date <= month.start_date &&
                                            TJM.end_date >= month.end_date
                                        ) {
                                            ca += TJM.value * month.nb_day;
                                        } else if (
                                            TJM.end_date >= month.start_date &&
                                            TJM.end_date < month.end_date
                                        ) {
                                            ca += TJM.value * month.nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * month.nb_day;
                                        } else if (
                                            format(pru.start_date, "yyyy-MM-dd") >= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") < month.end_date
                                        ) {
                                            ca -= pru.value * month.nb_day;
                                        }
                                    });
                                }
                            });
                        });
                        caOfCustomer.push({
                            id: customer.id,
                            label: customer.label,
                            month: month.monthNumber,
                            value: ca,
                            start_month: month.start_date,
                            end_month: month.end_date,
                            Projects: customer.Projects
                        });
                    });
                    // Ajout du chiffre d'affaires de ce client à la liste globale
                    caGlobalCustomers = caGlobalCustomers.concat(caOfCustomer);
                });

                // Filtrage pour obtenir le chiffre d'affaires du mois en cours
                let caOfActualMonthCustomer = [];
                caGlobalCustomers.forEach((month) => {
                    if (todayYYMMAAAA() >= month.start_month && todayYYMMAAAA() <= month.end_month) {
                        caOfActualMonthCustomer.push({ id: month.id, label: month.label, value: month.value, Projects: month.Projects });
                    }
                });

                return res.status(201).json({
                    caOfActualMonthCustomer, months
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ 'error': "Erreur lors du calcul du chiffre d'affaire client sur le mois" });
            });
    }

}