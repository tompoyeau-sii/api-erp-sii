const db = require("../../models").production.models;
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
        const name = req.body.name;
        const first_name = req.body.first_name;
        const birthdate = req.body.birthdate;
        const mail = req.body.mail;
        const start_date = req.body.start_date;
        const graduation_id = req.body.graduation_id;
        const job_id = req.body.job_id;
        const gender_id = req.body.gender;
        const pru = req.body.pru;
        const manager_id = req.body.manager_id;

        //Vérification que les champs sont bien complétés
        if (name == null ||
            first_name == null ||
            birthdate == null ||
            mail == null ||
            start_date == null ||
            graduation_id == null ||
            gender_id == null ||
            pru == null) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }

        //Si le collaborateur n'est pas un manager et que le champs manager n'est pas rempli, alors on envoi un message d'erreur 
        if (job_id != 1 && manager_id == null) {
            return res.status(400).json({ error: "Seul les collaborateurs ayant le poste manager peuvent ne pas avoir de manager." });
        }

        //On vérifie si le collaborateur n'existe pas déjà via son email
        db.Associate.findOne({
            attributes: ["mail"],
            where: { mail: mail },
        })
            .then(associateFound => {
                if (!associateFound) {
                    // try {
                    db.Associate.create({
                        first_name: first_name,
                        name: name,
                        gender_id: gender_id,
                        graduation_id: graduation_id,
                        birthdate: birthdate,
                        mail: mail,
                        start_date: start_date,
                    }).then(newAssociate => {
                        // Ajoutez le job avec les dates 
                        newAssociate.addJob(job_id, {
                            through: {
                                start_date: start_date,
                                end_date: '9999-12-31 23:59:59',
                            },
                        })
                            // Créez un PRU
                            .then(jobAdded => {
                                db.PRU.create({
                                    associate_id: newAssociate.id,
                                    start_date: start_date,
                                    end_date: '9999-12-31',
                                    value: pru,
                                })
                                    .then(pru => {
                                        // Ajoutez le manager avec les dates
                                        newAssociate.addManagers(manager_id, {
                                            through: {
                                                start_date: start_date,
                                                end_date: '9999-12-31 23:59:59',
                                            }.then(manager => {
                                                return res.status(201).json({
                                                    associateId: newAssociate.id,
                                                });
                                            })
                                        }).catch(err => {
                                            console.log(err)
                                            return res.status(500).json({ error: "Erreur lors de la création de l'association Manager - Collaborateur" });
                                        })
                                    }).catch(err => {
                                        console.log(err)
                                        return res.status(500).json({ error: "Erreur lors de la création du PRU du collaborateur" });
                                    })
                            }).catch(err => {
                                console.log(err)
                                return res.status(500).json({ error: "Erreur lors de l'ajout du poste du collaborateur" });
                            })
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: "Erreur lors de la création du collaborateur" });
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({ error: "Erreur lors de la création du collaborateur" });
                    })
                } else {
                    return res.status(409).json({ error: "L'associé existe déjà" });
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des collaborateurs" });
            })

    },
    findAllWithLimit: function (req, res) {
        const page = req.query.page || 1; // Récupère le numéro de la page depuis la requête (par défaut : 1)
        const limit = 10; // Nombre d'éléments par page
        const offset = (page - 1) * limit; // Calcul de l'offset en fonction de la page actuelle
        db.Associate.count()
            .then((nbAssociates) => {
                db.Associate.findAndCountAll({
                    order: [['name', 'ASC']],
                    include: [
                        {
                            model: db.Graduation,
                            foreignKey: 'graduation_id',
                            attributes: ['label'],
                        },
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
                            model: db.Job,
                            foreignKey: 'job_id',
                            attributes: ['label'],
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
                    ],
                    limit,
                    offset,
                })
                    .then((result) => {
                        const {count, rows} = result;
                        const totalPages = Math.ceil(nbAssociates / limit);
                        return res.status(201).json({
                            associate: rows,
                            totalPages,
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({ error: "Erreur lors de la récupération des collaborateurs" });
                    })
            })
    },
    findAll: function (req, res) {
        db.Associate.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: db.Graduation,
                    foreignKey: 'graduation_id',
                    attributes: ['label'],
                },
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
                    model: db.Job,
                    foreignKey: 'job_id',
                    attributes: ['label'],
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
            ],
        })
            .then((associate) => {

                return res.status(201).json({
                    associate,
                });
            }).catch(err => {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la récupération des collaborateurs" });
            })
    },

    findManager: function (req, res) {
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
        }).then(manager => {
            return res.status(201).json({
                manager,
            });
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la récupération des managers" });
        })
    },
    // Récupérer un client par son identifiant
    findById: function (req, res) {
        const associateId = req.params.id;
        const currentDate = new Date(); // Obtenez la date actuelle

        db.Associate.findOne({
            where: { id: associateId },
            include: [
                {
                    model: db.Graduation,
                    foreignKey: "graduation_id",
                },
                {
                    model: db.Associate,
                    as: 'managers',
                    through: {
                        where: {
                            [Op.and]: [
                                {
                                    start_date: {
                                        [Op.lt]: currentDate
                                    }
                                },
                                {
                                    end_date: {
                                        [Op.gt]: currentDate
                                    }
                                }
                            ]
                        },
                        attributes: ['start_date', 'end_date'],
                    },
                },
                {
                    model: db.PRU,
                    foreignKey: "associate_id",
                },
                {
                    model: db.Job,
                    foreignKey: "job_id",
                },
                {
                    model: db.Mission,
                    foreignKey: "associate_id",
                    include: [
                        {
                            model: db.Project,
                            foreignKey: "project_id",
                            include: [
                                {
                                    model: db.Customer,
                                    foreignKey: 'customer_id',
                                    duplicating: false
                                },
                            ]
                        },
                        {
                            model: db.TJM,
                            foreignKey: 'mission_id',
                            where: {
                                [Op.and]: [
                                    {
                                        start_date: {
                                            [Op.lt]: currentDate
                                        }
                                    },
                                    {
                                        end_date: {
                                            [Op.gt]: currentDate
                                        }
                                    }
                                ]
                            },
                            required: false // Permet de récupérer toutes les missions même si elles n'ont pas de TJM correspondant aux critères de date
                        }
                    ]
                },
            ]
        })
            .then(associate => {
                if (!associate) {
                    return res.status(404).json({ error: "Aucun collaborateur trouvé" });
                }
                return res.status(200).json(associate);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la récupération de l'associé" });
            });
    },
    update: function (req, res) {
        const associateId = req.params.id;
        db.Associate.findOne({
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
                const manager_id = req.body.manager_id;
                if (name == null ||
                    first_name == null ||
                    birthdate == null ||
                    mail == null ||
                    start_date == null ||
                    graduation_id == null ||
                    gender_id == null ||
                    pru == null) {
                    return res.status(400).json({ error: "Paramètre(s) manquant(s)" });
                }

                if (job_id != 1 && manager_id == null) {
                    return res.status(400).json({ error: "Seul les collaborateurs ayant le poste manager peuvent ne pas avoir de manager." });
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
                        db.Associate_Job.findOne({
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
                                    //On vérifie que le collaborateur à commencé à travailler
                                    if (updateAssociate.start_date < today()) {
                                        // On change la date de fin du précédent par celle aujourd'hui
                                        lastJob.update({ end_date: today() })
                                        // On créer la nouvelle association entre un job et un collab
                                        updateAssociate.addJob(job_id, { through: { start_date: today(), end_date: '9999-12-31 23:59:59' } })
                                    } else {
                                        lastJob.destroy()
                                        updateAssociate.addJob(job_id, { through: { start_date: updateAssociate.start_date, end_date: '9999-12-31 23:59:59' } })
                                    }
                                }
                            } else {
                                updateAssociate.addJob(job_id, { through: { start_date: today(), end_date: '9999-12-31 23:59:59' } })
                            }
                        })
                        db.Associate_Manager.findOne({
                            where: { associate_id: updateAssociate.id },
                            order: [
                                ['createdAt', 'DESC'],
                            ],
                            limit: 1,
                        }).then(function (lastManager) {
                            //on vérifie qu'il y en a bien un sinon on en créer un
                            if (lastManager != null) {
                                // On vérifie que le manager est bien différent du précédent
                                if (lastManager.manager_id != manager_id) {
                                    //On vérifie que le collaborateur à commencé à travailler
                                    if (updateAssociate.start_date < today()) {
                                        // On change la date de fin du précédent par celle aujourd'hui
                                        const today2 = new Date();
                                        lastManager.update({ end_date: today2 })
                                        console.log(today2)
                                        // On créer la nouvelle association entre un job et un collab
                                        db.Associate_Manager.create({
                                            associate_id: updateAssociate.id,
                                            manager_id: manager_id,
                                            start_date: today(),
                                            end_date: '9999-12-31 23:59:59'
                                        }
                                        )
                                    } else {
                                        lastManager.destroy()
                                        db.Associate_Manager.create({

                                            associate_id: updateAssociate.id,
                                            manager_id: manager_id,
                                            start_date: updateAssociate.start_date,
                                            end_date: '9999-12-31 23:59:59'
                                        }
                                        )
                                    }
                                }
                            }
                        })
                        console.log(updateAssociate.id)
                        // on récupére le dernier PRU créer pour ce collaborateur
                        db.PRU.findOne({
                            where: { associate_id: updateAssociate.id },
                            order: [
                                ['updatedAt', 'DESC'],
                            ],
                            limit: 1,
                        }).then(function (lastPru) {
                            //on vérifie bien que la valeur du pru est différente
                            if (lastPru != null && lastPru.value != pru) {
                                if (updateAssociate.start_date < today()) {
                                    //on modifie la date de fin du précédent PRU en mettant la date du jour comme fin
                                    lastPru.update({ end_date: today() });
                                    //on créer un nouveau PRU avec les nouvelles valeurs commençant à la date du jour
                                    db.PRU.create({
                                        associate_id: updateAssociate.id,
                                        start_date: today(),
                                        end_date: '9999-12-31',
                                        value: pru
                                    })
                                } else {
                                    lastPru.destroy();
                                    db.PRU.create({
                                        associate_id: updateAssociate.id,
                                        start_date: updateAssociate.start_date,
                                        end_date: '9999-12-31',
                                        value: pru
                                    })
                                }
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
    },
};
