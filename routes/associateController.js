const models = require("../models");

module.exports = {
    //Creation of an associate
    create: function (req, res) {
        const name = req.body.name;
        const first_name = req.body.first_name;
        const birthdate = req.body.birthdate;
        const telephone = req.body.telephone;
        const mail = req.body.mail;
        const hourRate = req.body.hourRate;
        if (
            name == null ||
            first_name == null ||
            birthdate == null ||
            telephone == null ||
            mail == null ||
            hourRate == null
        ) {
            return res.status(400).json({ error: "missing parameters" });
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
                        hourRate: hourRate
                    })
                        .then(function (newAssociate) {
                            return res.status(201).json({
                                associateId: newAssociate.id,
                            });
                        })
                        .catch(function (err) {
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
            attributes: ["id", "name", "first_name", "hourRate", "birthdate"],
        })
            .then((associate) => {
                return res.status(201).json({
                    associate,
                });
            })
            .catch((error) => console.error(error));
    },
};
