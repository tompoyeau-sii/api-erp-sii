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
// Créer une nouvelle instance de l'objet Date
function hour() {
    var date = new Date();
    var heures = ('0' + date.getHours()).slice(-2); // Heures (ajoute un zéro devant si nécessaire)
    var minutes = ('0' + date.getMinutes()).slice(-2); // Minutes (ajoute un zéro devant si nécessaire)
    var secondes = ('0' + date.getSeconds()).slice(-2);
    return heuresActuel = heures + ':' + minutes + ':' + secondes;
}


module.exports = {
    //Creation of an associate
    create: function (req, res) {
        const name = req.body.name;
        const first_name = req.body.first_name;
        const birthdate = req.body.birthdate;
        const mail = req.body.mail;
        const start_date = req.body.start_date;
        const graduation_id = req.body.graduation_id;
        const job_id = req.body.job_id;
        const gender_id = req.body.gender;
        const pru = req.body.pru;
        if (
            name == null
            || first_name == null
            || birthdate == null
            || mail == null
            || start_date == null
            || graduation_id == null
            || job_id == null
            || gender_id == null
            || pru == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        console.log(start_date)
        models.Associate.findOne({
            attributes: ["mail"],
            where: { mail: mail },
        })
            .then(function (associateFound) {
                if (!associateFound) {
                    const newAssociate = models.Associate.create({
                        first_name: first_name,
                        name: name,
                        gender_id: gender_id,
                        graduation_id: graduation_id,
                        birthdate: birthdate,
                        mail: mail,
                        start_date: start_date,
                    }).then(function (newAssociate) {
                        const newAssociateJob = newAssociate.addJob(job_id, { through: { start_date: start_date, end_date: '9999-12-31 23:59:59' } })
                        const newPRU = models.PRU.create({
                            associate_id: newAssociate.id,
                            start_date: start_date,
                            end_date: '9999-12-31',
                            value: pru
                        })
                            .catch(function (err) {
                                console.log(err)
                                return res.status(500).json({ error: "PRU trouble" });
                            })
                        return res.status(201).json({
                            associateId: newAssociate.id,
                        });

                    }).catch(function (err) {
                        console.log(err)
                        return res.status(500).json({ error: "cannot add associate" });
                    });
                } else {
                    return res.status(409).json({ error: "associate already exist" });
                }
            })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "unable to verify account" });
            });
    },

    findAll: function (req, res) {
        const page = req.query.page || 1; // Récupère le numéro de la page depuis la requête (par défaut : 1)
        const limit = 10; // Nombre d'éléments par page
        const offset = (page - 1) * limit; // Calcul de l'offset en fonction de la page actuelle
        models.Associate.count().then((nbAssociates) => {
            models.Associate.findAndCountAll({
                order: [['name', 'ASC']],
                include: [
                    {
                        model: models.Graduation,
                        foreignKey: 'graduation_id',
                    },
                    {
                        model: models.PRU,
                        foreignKey: 'associate_id',
                    },
                    {
                        model: models.Job,
                        foreignKey: 'job_id',
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
                                    {
                                        model: models.Associate,
                                        foreignKey: 'manager_id',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                limit,
                offset,
            })
                .then((result) => {
                    const { count, rows } = result;

                    const totalPages = Math.ceil(nbAssociates / limit);
                    console.log(totalPages)

                    return res.status(201).json({
                        associate: rows,
                        totalPages,
                    });
                })
                .catch((error) => console.error(error));
        })
    },
    pdc: function (req, res) {
        models.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: models.Graduation,
                    foreignKey: 'graduation_id',
                },
                {
                    model: models.PRU,
                    foreignKey: 'associate_id',
                },
                {
                    model: models.Job,
                    foreignKey: 'job_id',
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
                                {
                                    model: models.Associate,
                                    foreignKey: 'manager_id',
                                },
                            ],
                        },
                    ],
                },
            ],
        })
            .then((associate) => {

                return res.status(201).json({
                    associate,
                });
            })
            .catch((error) => console.error(error));
    },

    findManager: function (req, res) {
        models.Job.findAll({
            where: { id: 3 },
            include:
            {
                model: models.Associate,
                include:
                    [
                        {
                            model: models.PRU,
                            foreignKey: 'associate_id'
                        },
                        {
                            model: models.Project,
                            foreignKey: "associate_id",
                            include:
                            {
                                model: models.Mission,
                                foreignKey: 'project_id',
                                include: [
                                    {
                                        model: models.Associate,
                                        foreignKey: 'associate_id',
                                        include: {
                                            model: models.PRU,
                                            foreignKey: 'associate_id'
                                        }
                                    },
                                    {
                                        model: models.TJM,
                                        foreignKey: 'mission_id'
                                    },
                                    {
                                        model: models.Imputation,
                                        foreignKey: 'mission_id'
                                    },
                                ]
                            }
                        },
                    ]
            }
        }).then((associate) => {
            return res.status(201).json({
                associate,
            });
        })
            .catch((error) => console.error(error));
    },

    // Récupérer un client par son identifiant
    findById: function (req, res) {
        const associateId = req.params.id;

        models.Associate.findOne({
            where: { id: associateId },
            include: [
                {
                    model: models.Graduation,
                    foreignKey: "graduation_id",
                },
                {
                    model: models.PRU,
                    foreignKey: "associate_id",
                },
                {
                    model: models.Job,
                    foreignKey: "job_id",
                },
                {
                    model: models.Mission,
                    foreignKey: "associate_id",
                    include: [
                        {
                            model: models.Project,
                            foreignKey: "project_id",
                            // limit: 1,
                            include: [
                                {
                                    model: models.Customer,
                                    foreignKey: 'customer_id',
                                    duplicating: false
                                },
                                {
                                    model: models.Associate,
                                    foreignKey: 'manager_id'
                                }
                            ]
                        },
                        {
                            model: models.TJM,
                            foreignKey: 'mission_id'
                        },
                        {
                            model: models.Imputation,
                            foreignKey: 'mission_id'
                        }
                    ]
                },
            ]
        })
            .then((associate) => {
                if (!associate) {
                    return res.status(404).json({ error: "associate not found" });
                }

                return res.status(200).json(associate);
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: "unable to fetch associate" });
            });
    },
    findByName: function (req, res) {
        const associateName = req.params.name;

        models.Associate.findOne({
            where: { name: associateName },
        })
            .then((associate) => {
                if (!associate) {
                    return res.status(404).json({ error: "customer not found" });
                }

                return res.status(200).json(associate);
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: "unable to fetch customer" });
            });
    },
    update: function (req, res) {
        const associateId = req.params.id;
        models.Associate.findOne({
            where: { id: associateId },
        })
            .then(function (associate) {
                if (!associate) {
                    return res.status(404).json({ error: "associate not found" });
                }
                const name = req.body.name || associate.name;
                const first_name = req.body.first_name || associate.first_name;
                const birthdate = req.body.birthdate || associate.birthdate;
                const gender_id = req.body.gender || associate.gender_id;
                const graduation_id = req.body.graduation || associate.graduation_id;
                const job_id = req.body.job_id
                const start_date = req.body.start_date || associate.start_date;
                const pru = req.body.pru;
                const mail = req.body.mail || associate.mail;
                const end_date = req.body.end_date || associate.end_date;
                if (
                    name == null
                    || first_name == null
                    || birthdate == null
                    || mail == null
                    || start_date == null
                    || graduation_id == null
                    || job_id == null
                    || gender_id == null
                    || pru == null
                ) {
                    return res.status(400).json({ error: "Paramètres manquants" });
                }
                return associate.update({
                    name: name,
                    first_name: first_name,
                    birthdate: birthdate,
                    mail: mail,
                    graduation_id: graduation_id,
                    start_date: start_date,
                    end_date: end_date,
                })
                    .then(function (updateAssociate) {
                        //on récupére le dernier job
                        models.Associate_Job.findOne({
                            where: { associate_id: updateAssociate.id },
                            order: [
                                ['createdAt', 'DESC'],
                            ],
                            limit: 1,
                        }).then(function (lastJob) {
                            //on vérifie qu'il y en a bien un sinon on en créer un
                            if (lastJob != null) {
                                // On vérifie que le job est bien différent du précédant
                                if (lastJob.job_id != job_id) {
                                    // On change la date de fin du précédent par celle aujourd'hui
                                    lastJob.update({ end_date: today() })
                                    // On créer la nouvelle association entre un job et un collab
                                    updateAssociate.addJob(job_id, { through: { start_date: today(), end_date: '9999-12-31 23:59:59' } })
                                }
                            } else {
                                updateAssociate.addJob(job_id, { through: { start_date: today(), end_date: '9999-12-31 23:59:59' } })
                            }
                        })

                        // on récupére le dernier PRU créer pour ce collaborateur
                        models.PRU.findOne({
                            where: { associate_id: updateAssociate.id },
                            order: [
                                ['updatedAt', 'DESC'],
                            ],
                            limit: 1,
                        }).then(function (lastPru) {
                            //on vérifie bien que la valeur du pru est différente
                            if (lastPru != null && lastPru.value != pru) {
                                //on modifie la date de fin du précédent PRU en mettant la date du jour comme fin
                                lastPru.update({ end_date: today() });
                                //on créer un nouveau PRU avec les nouvelles valeurs commençant à la date du jour
                                models.PRU.create({
                                    associate_id: updateAssociate.id,
                                    start_date: today(),
                                    end_date: '9999-12-31',
                                    value: pru
                                })
                            }
                        })
                        return res.status(200).json(associate);
                    })
                    .catch(function (err) {
                        console.log(err);
                        return res.status(500).json({ error: "cannot update associate" });
                    });
            })
            .catch(function (err) {
                console.log(err);
                return res.status(500).json({ error: "unable to fetch associate" });
            });
    }

};
