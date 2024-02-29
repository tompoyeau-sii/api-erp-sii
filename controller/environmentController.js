const process = require("process");
const { exec } = require("child_process");

module.exports = {

    refreshSimulation: function (req, res) {
        try {
            // Exécute le script Python savebdd.py
            exec("python savebdd.py", (error, stdout, stderr) => {
                console.log(`Script Python exécuté avec succès : ${stdout}`);
                res.status(200).json({ message: 'Mise à jour de la simulation réussi.' });
            });
        } catch (error) {
            console.error('Erreur lors de l\'exécution du script Python :', error);
            res.status(500).json({ message: 'Erreur lors de l\'exécution du script Python.' });
        }
    }
}
