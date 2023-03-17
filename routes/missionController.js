const models = require("../models");

module.exports = {
    create: function (req, res) {
        const label = req.body.label;
        const mission_id = req.body.mission_id;
        const associate_id = req.body.associate_id;
        if (
            label == null,
            mission_id == null,
            associate_id == null
        ) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }
        models.Project.findOne({
            attributes: ["label"],
            where: { label: label },
        })
            .then(function (missionFound) {
                if (!missionFound) {
                    const newMission = models.Mission.create({
                        label: label,
                        mission_id: mission_id,
                        associate_id: associate_id,
                    })
                        .then(function (newMission) {
                            return res.status(201).json({
                                missionId: newMission.id,
                            });
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(500).json({ error: "cannot add mission" });
                        });
                } else {
                    return res.status(409).json({ error: "mission already exist" });
                }
            })
            .catch(function (err) {
                return res.status(500).json({ error: "unable to verify mission" });
            });
    },
    findAll: function (req, res) {
        models.Mission.findAll()
            .then((mission) => {
                return res.status(201).json({
                    mission,
                });
            })
            .catch((error) => console.error(error));
    },
}