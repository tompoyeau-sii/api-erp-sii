const models = require("../models");

module.exports = {
    test: function (req, res) {
        models.Associates.findAll({
            include: 
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
            
        }).then((associates) => {
            return res.status(201).json({
                associates,
            });
            // Vous pouvez accéder aux associés ici
        }).catch((error) => {
            // Gérer les erreurs
        });
    },
}