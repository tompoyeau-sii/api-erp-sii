const db = require("../../models").pettazzoni.models;
const {
    startOfMonth,
    endOfMonth,
    eachMonthOfInterval,
    format,
    parseISO
} = require("date-fns");
const { Op } = require("sequelize");
const { fr } = require("date-fns/locale");


//Génére la liste des mois de l'année passée en paramètre allant de S14 à S13
function generateMonthList(year) {
    const list_start = startOfMonth(new Date(year, 3, 1));
    const list_end = startOfMonth(new Date(year + 1, 2, 1));
    const monthsList = eachMonthOfInterval({
        start: list_start,
        end: list_end,
        monthStartsOn: 1,
    });

    const allMonths = monthsList.map((date) => {
        const month = format(date, "MMMM", { locale: fr });
        const startDateOfMonth = startOfMonth(date, { weekStartsOn: 1 });
        const endDateOfMonth = endOfMonth(date, { weekEndsOn: 1 });

        return {
            monthNumber: month,
            start_date: format(startDateOfMonth, "yyyy-MM-dd"),
            end_date: format(endDateOfMonth, "yyyy-MM-dd"),
        };
    });
    return allMonths;
}

function today(year) {
    let date = new Date();
    if (date >= new Date(year, 0, 1) && date < new Date(year, 3, 1)) {
        year++; // Si la date est entre le 1er janvier et le 31 mars, l'année est N+1
    }
    date.setFullYear(year)
    return format(date, 'yyyy-MM-dd');
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
                            model: db.WorkedDays,
                            foreignKey: "associate_id"
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
                                        model: db.WorkedDays,
                                        foreignKey: "associate_id"
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
                            manager.WorkedDays.forEach(workeddays => {
                                if (workeddays.start_date == month.start_date) {
                                    manager.PRUs.forEach((PRU) => {

                                        if (
                                            format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.end_date && // Vérifie si la date de début du PRU est antérieure ou égale à la date de fin du mois
                                            format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.start_date // Vérifie si la date de fin du PRU est postérieure ou égale à la date de début du mois
                                        ) {
                                            value -= PRU.value * workeddays.nb_day;
                                            marge -= PRU.value * workeddays.nb_day;

                                        }
                                    });
                                }
                            })
                            manager.associates.forEach((collab) => {
                                let nb_day = 18;
                                if (collab.WorkedDays) {
                                    collab.WorkedDays.forEach(workedday => {
                                        if (workedday.month_date == month.start_date) {
                                            nb_day = workedday.nb_day
                                        }
                                    })
                                }
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
                                                console.log(value)
                                                console.log(marge)
                                                value += TJM.value * nb_day;
                                                marge += TJM.value * nb_day;
                                            }
                                        });

                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.start_date &&
                                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value -= PRU.value * nb_day;
                                                marge -= PRU.value * nb_day;
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
                                                console.log(value)
                                                console.log(marge)
                                                value += TJM.value * nb_day;
                                                marge += TJM.value * nb_day;
                                            } else if (
                                                TJM.start_date >= month.start_date &&
                                                TJM.start_date < month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value += TJM.value * nb_day;
                                                marge += TJM.value * nb_day;
                                            }
                                        });
                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.start_date &&
                                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value -= PRU.value * nb_day;
                                                marge -= PRU.value * nb_day;
                                            } else if (
                                                format(parseISO(PRU.start_date), "yyyy-MM-dd") >= month.start_date &&
                                                format(parseISO(PRU.start_date), "yyyy-MM-dd") < month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value -= PRU.value * nb_day;
                                                marge -= PRU.value * nb_day;
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
                                                console.log(value)
                                                console.log(marge)
                                                value += TJM.value * nb_day;
                                                marge += TJM.value * nb_day;
                                            } else if (
                                                TJM.end_date >= month.start_date &&
                                                TJM.end_date < month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value += TJM.value * nb_day;
                                                marge += TJM.value * nb_day;
                                            }
                                        });
                                        mission.Associate.PRUs.forEach((PRU) => {
                                            if (
                                                format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.start_date &&
                                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value -= PRU.value * nb_day;
                                                marge -= PRU.value * nb_day;
                                            } else if (
                                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.start_date &&
                                                format(parseISO(PRU.end_date), "yyyy-MM-dd") < month.end_date
                                            ) {
                                                console.log(value)
                                                console.log(marge)
                                                value -= PRU.value * nb_day;
                                                marge -= PRU.value * nb_day;
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
        const year = parseInt(req.query.year);
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
                                    [Op.lt]: today(year)
                                }
                            },
                            {
                                end_date: {
                                    [Op.gt]: today(year)
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
                {
                    model: db.WorkedDays,
                    foreignKey: "associate_id"
                }
            ],
        })
            .then((associate) => {

                const months = generateMonthList(year)
                let ca = 0;
                caForMonths = [];
                months.forEach((month) => {
                    associate.forEach((associate) => {
                        let nb_day = 18;
                        if (associate.WorkedDays) {
                            associate.WorkedDays.forEach(workedday => {
                                if (workedday.month_date == month.start_date) {
                                    nb_day = workedday.nb_day
                                }
                            })
                        }
                        associate.PRUs.forEach((PRU) => {
                            if (
                                format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.start_date &&
                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.end_date
                            ) {

                                ca -= PRU.value * nb_day;
                            } else if (
                                format(parseISO(PRU.start_date), "yyyy-MM-dd") >= month.start_date &&
                                format(parseISO(PRU.start_date), "yyyy-MM-dd") <= month.end_date
                            ) {
                                ca -= PRU.value * nb_day;
                            } else if (
                                format(parseISO(PRU.end_date), "yyyy-MM-dd") >= month.start_date &&
                                format(parseISO(PRU.end_date), "yyyy-MM-dd") <= month.end_date
                            ) {
                                ca -= PRU.value * nb_day;
                            }
                        });
                        associate.Missions.forEach((mission) => {
                            mission.TJMs.forEach((tjm) => {
                                if (
                                    tjm.start_date <= month.start_date &&
                                    tjm.end_date >= month.end_date
                                ) {
                                    ca += tjm.value * nb_day;
                                } else if (
                                    tjm.start_date >= month.start_date &&
                                    tjm.start_date <= month.end_date
                                ) {
                                    ca += tjm.value * nb_day;
                                } else if (
                                    tjm.end_date >= month.start_date &&
                                    tjm.end_date <= month.end_date
                                ) {
                                    ca += tjm.value * nb_day;
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
        const year = parseInt(req.query.year);
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
                                    [Op.contains]: [today(year), today(year)]
                                },
                            },
                            include: [
                                {
                                    model: db.Associate,
                                    foreignKey: "associate_id",
                                    include:
                                        [
                                            {
                                                model: db.PRU,
                                                foreignKey: "associate_id"
                                            },
                                            {
                                                model: db.WorkedDays,
                                                foreignKey: "associate_id"
                                            }
                                        ]
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

                const months = generateMonthList(year)
                months.forEach((month) => {
                    customer.Projects.forEach((project) => {
                        project.Missions.forEach((mission) => {
                            let nb_day = 18;
                            if (mission.Associate.WorkedDays) {
                                mission.Associate.WorkedDays.forEach(workedday => {
                                    if (workedday.month_date == month.start_date) {
                                        nb_day = workedday.nb_day
                                    }
                                })
                            }
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
                                        ca += tjm.value * nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(parseISO(pru.start_date), "yyyy-MM-dd") <= month.start_date &&
                                        format(parseISO(pru.end_date), "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * nb_day;
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
                                        ca += TJM.value * nb_day;
                                    } else if (
                                        TJM.start_date >= month.start_date &&
                                        TJM.start_date < month.end_date
                                    ) {
                                        ca += TJM.value * nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(parseISO(pru.start_date), "yyyy-MM-dd") <= month.start_date &&
                                        format(parseISO(pru.end_date), "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * nb_day;
                                    } else if (
                                        format(parseISO(pru.start_date), "yyyy-MM-dd") >= month.start_date &&
                                        format(parseISO(pru.end_date), "yyyy-MM-dd") < month.end_date
                                    ) {
                                        ca -= pru.value * nb_day;
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
                                        ca += TJM.value * nb_day;
                                    } else if (
                                        TJM.end_date >= month.start_date &&
                                        TJM.end_date < month.end_date
                                    ) {
                                        ca += TJM.value * nb_day;
                                    }
                                });
                                mission.Associate.PRUs.forEach((pru) => {
                                    if (
                                        format(parseISO(pru.start_date), "yyyy-MM-dd") <= month.start_date &&
                                        format(parseISO(pru.end_date), "yyyy-MM-dd") >= month.end_date
                                    ) {
                                        ca -= pru.value * nb_day;
                                    } else if (
                                        format(parseISO(pru.start_date), "yyyy-MM-dd") >= month.start_date &&
                                        format(parseISO(pru.end_date), "yyyy-MM-dd") < month.end_date
                                    ) {
                                        ca -= pru.value * nb_day;
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

        const year = parseInt(req.query.year);

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
                                    [Op.contains]: [today(year), today(year)]
                                },
                            },
                            include: [
                                {
                                    model: db.Associate,
                                    foreignKey: "associate_id",
                                    include:
                                        [
                                            {
                                                model: db.PRU,
                                                foreignKey: "associate_id"
                                            },
                                            {
                                                model: db.WorkedDays,
                                                foreignKey: "associate_id"
                                            }
                                        ]
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
                const months = generateMonthList(year)
                customers.forEach((customer) => {
                    let ca = 0;
                    let caOfCustomer = [];
                    months.forEach((month) => {
                        customer.Projects.forEach((project) => {
                            project.Missions.forEach((mission) => {
                                let nb_day = 18;
                                if (mission.Associate.WorkedDays) {
                                    mission.Associate.WorkedDays.forEach(workedday => {
                                        if (workedday.month_date == month.start_date) {
                                            nb_day = workedday.nb_day
                                        }
                                    })
                                }
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
                                            ca += tjm.value * nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(parseISO(pru.start_date), "yyyy-MM-dd") <= month.start_date &&
                                            format(parseISO(pru.end_date), "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * nb_day;
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
                                            ca += TJM.value * nb_day;
                                        } else if (
                                            TJM.start_date >= month.start_date &&
                                            TJM.start_date < month.end_date
                                        ) {
                                            ca += TJM.value * nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(pru.start_date, "yyyy-MM-dd") <= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * nb_day;
                                        } else if (
                                            format(pru.start_date, "yyyy-MM-dd") >= month.start_date &&
                                            format(pru.end_date, "yyyy-MM-dd") < month.end_date
                                        ) {
                                            ca -= pru.value * nb_day;
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
                                            ca += TJM.value * nb_day;
                                        } else if (
                                            TJM.end_date >= month.start_date &&
                                            TJM.end_date < month.end_date
                                        ) {
                                            ca += TJM.value * nb_day;
                                        }
                                    });
                                    mission.Associate.PRUs.forEach((pru) => {
                                        if (
                                            format(parseISO(pru.start_date), "yyyy-MM-dd") <= month.start_date &&
                                            format(parseISO(pru.end_date), "yyyy-MM-dd") >= month.end_date
                                        ) {
                                            ca -= pru.value * nb_day;
                                        } else if (
                                            format(parseISO(pru.start_date), "yyyy-MM-dd") >= month.start_date &&
                                            format(parseISO(pru.end_date), "yyyy-MM-dd") < month.end_date
                                        ) {
                                            ca -= pru.value * nb_day;
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
                    if (today(year) >= month.start_month && today(year) <= month.end_month) {
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