const models = require("../models");
const { Op } = require("sequelize");
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

function isWorking(associate, year) {
    this.loading = true;
    if (
        associate.start_date >= year.endDate ||
        associate.end_date < year.startDate
    ) {
        this.loading = false;
        return 3;
    }
    for (let mission of associate.Missions) {
        if (
            mission.start_date < year.endDate &&
            mission.end_date > year.startDate
        ) {
            this.loading = false;
            return 1;
        }
    }
    this.loading = false;
    return 2;
};

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

        const selectedYear = 2023;
        const weeks = weeksFilter(generateWeekList(selectedYear));
        const pdc = [];

        models.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: models.Graduation,
                    foreignKey: 'graduation_id',
                    attributes: ['label'],
                },
                {
                    model: models.PRU,
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
                    var week_info = {
                        weekNumber: 'S' + week.weekNumber,
                        associates: []
                    };

                    associates.forEach((associate) => {
                        state = isWorking(associate, week);
                        full_name = associate.first_name + ' ' + associate.name
                        week_info.associates.push({
                            full_name: full_name,
                            state: state
                        });
                    });

                    pdc.push(week_info);
                });

                return res.status(201).json({
                    pdc
                });

            }).catch((error) => console.error(error));
    },
};