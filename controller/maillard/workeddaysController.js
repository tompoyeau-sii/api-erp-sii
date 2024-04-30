const db = require("../../models").maillard.models;
const { Op } = require("sequelize");
const { format } = require("date-fns");
function today(offset = 0) {
    let date = new Date();
    if (offset !== 0) {
        date = addDays(date, offset);
    }
    return format(date, 'yyyy-MM-dd');
}
module.exports = {
    create: function (req, res) {
        const associate_id = req.body.associate_id;
        const month_date = req.body.month_date;
        const nb_day = req.body.nb_day;
        if (
            associate_id == null,
            month_date == null,
            nb_day == null
        ) {
            return res.status(400).json({ error: "Champs manquants" });
        }
        db.WorkedDays.create({
            associate_id: associate_id,
            month_date: month_date,
            nb_day: nb_day
        })
            .then(workedDayCreated => {
                return res.status(201).json({ wordkedDay: workedDayCreated });
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ error: "Erreur server lors de la création des jours travaillé", details: err });
            });
    },
    update: function (req, res) {
        const associate_id = req.body.associate_id;
        const month_date = req.body.month_date;
        const nb_day = req.body.nb_day;
        if (
            associate_id == null,
            month_date == null,
            nb_day == null
        ) {
            return res.status(400).json({ error: "Champs manquants" });
        }

        db.WorkedDays.findOne({
            where: {
                associate_id: associate_id,
                month_date: month_date,
            }
        })
            .then(workedDayFound => {
                workedDayFound.update({ nb_day: nb_day })
                    .then(workedDayUpdated => {
                        return res.status(201).json({ wordkedDay: workedDayUpdated });
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: "Erreur server lors de la mise à jour des jours travaillé", details: err });
                    });
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ error: "Erreur server lors de la récupération des jours travaillé", details: err });
            });
    },

    getAssociatesWorkedDaysByMonth: function (req, res) {
        const month_date = req.query.month;
        console.log(month_date)
        const researchCollab = req.query.search;
        const selected_manager = req.query.manager;
        const selected_customer = req.query.customer;
        const selected_project = req.query.project;

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
                    model: db.WorkedDays,
                    foreignKey: 'associate_id',
                },
            ],
        })
            .then(associates => {

                let filteredAssociates = [];
                associates.forEach((associate) => {

                    full_name = associate.first_name + ' ' + associate.name;
                    let projects = []
                    let customers = []
                    let managers = []

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

                    const filteredAssociate = {
                        id: associate.id,
                        full_name: full_name,
                        projects: projects,
                        customers: customers,
                        managers: managers,
                        start_date: associate.start_date,
                        end_date: associate.end_date,
                        Missions: associate.Missions,
                        nb_day: null,
                    };

                    associate.WorkedDays.forEach((days) => {
                        if (days.month_date == month_date) {
                            filteredAssociate.nb_day = days.nb_day;
                        }
                    });

                    filteredAssociates.push(filteredAssociate)


                    if (researchCollab) {
                        const searchTerm = researchCollab.toLowerCase();
                        filteredAssociates = filteredAssociates.filter((associate) => {
                            return associate.full_name.toLowerCase().includes(searchTerm);
                        });
                    }

                    // filtre sur le manager
                    if (selected_manager) {
                        filteredAssociates = filteredAssociates.filter((associate) =>
                            associate.managers.some((manager) => manager === selected_manager)
                        );
                    }

                    // filtre sur le client
                    if (selected_customer) {
                        filteredAssociates = filteredAssociates.filter((associate) =>
                            associate.customers.some(
                                (customer) => customer === selected_customer
                            )
                        );
                    }

                    //filtre sur le projet
                    if (selected_project) {
                        filteredAssociates = filteredAssociates.filter((associate) =>
                            associate.projects.some((project) => project === selected_project)
                        );
                    }

                });

                return res.status(201).json({ associate: filteredAssociates });
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ error: "Erreur server lors de la récupération des collaborateurs", details: err });
            });
    },
}