const models = require("../models");
const graduation = require("../models/graduation");

module.exports = {
    //Creation of an associate
    create: function (req, res) {
        const name = req.body.name;
        const first_name = req.body.first_name;
        const birthdate = req.body.birthdate;
        const telephone = req.body.telephone;
        const mail = req.body.mail;
        const start_date = req.body.start_date;
        if (
            name == null
            || first_name == null
            || birthdate == null
            || telephone == null
            || mail == null
            || start_date == null
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
                        name: name,
                        first_name: first_name,
                        birthdate: birthdate,
                        telephone: telephone,
                        mail: mail,
                        start_date: start_date,
                    })
                        .then(function (newAssociate) {
                            return res.status(201).json({
                                associateId: newAssociate.id,
                            });
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "cannot add associate" });
                        });
                } else {
                    return res.status(409).json({ error: "associate already exist" });
                }
            })
            .catch(function (err) {
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
    edit: function (req, res) {
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

                return associate.update({
                    name: name,
                    first_name: first_name,
                    birthdate: birthdate,
                    telephone: telephone,
                    mail: mail,
                    start_date: start_date,
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
