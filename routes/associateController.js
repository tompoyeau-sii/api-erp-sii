const models = require("../models");

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
                        const newAssociateJob = newAssociate.addJob(job_id, { through: { start_date: start_date, end_date: '9999-12-31' } })
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
        models.Associate.findAll({
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
                    foreignKey: "job_id"
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
                        }
                    ]
                },
            ]
        }).then((associate) => {
            return res.status(201).json({
                associate,
            });
        })
            .catch((error) => console.error(error));
    },

    findManager: function (req, res) {
        models.Associate.findAll({

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
                    where: {
                        id: 3
                    },
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
                        }
                    ]
                },
            ]
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
                const telephone = req.body.telephone || associate.telephone;
                const mail = req.body.mail || associate.mail;
                const start_date = req.body.start_date || associate.start_date;
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
                    telephone: telephone,
                    mail: mail,
                    start_date: start_date,
                    end_date: end_date,
                })
                    .then(function () {
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
