const db = require("../../models").gourmel.models;

module.exports = {
    update: function (req, res) {
        const id = req.params.id;
        const value = req.body.value;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;
        if (
            id == null,
            value == null,
            start_date == null,
            end_date == null
        ) {
            return res.status(400).json({ error: "Champs manquants" });
        }
        db.PRU.findOne({
            where: { id: id },
        })
            .then(pruFound => {
                if (pruFound) {
                    pruFound.update({
                        value: value,
                        start_date: start_date,
                        end_date: end_date,
                    })
                        .then(pruUpdated => {
                            return res.status(201).json({ pruId: pruUpdated });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).json({ error: "Erreur server lors de la mise à jour du pru" });
                        });
                } else {
                    return res.status(409).json({ error: "Impossible de retrouver le pru" });
                }
            })
            .catch(function (err) {
                console.log(err)
                return res.status(500).json({ error: "Erreur server lors de la récupération des postes" });
            });
    },
}