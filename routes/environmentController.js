const process = require("process");

module.exports = {
    // Nouvelle méthode pour changer la variable d'environnement NODE_ENV
    changeEnvironment: async function (req, res) {
        try {

            const { configLabel } = req.body;
            if (!configLabel) {
                return res.status(400).json({ error: 'Missing config label in request body.' });
            }

            // Vérifiez si le libellé de la configuration existe dans le fichier config.json
            if (!config[configLabel]) {
                return res.status(400).json({ error: 'Invalid config label.' });
            }

            // Fermez la connexion existante à la base de données
            await sequelize.close();

            // Ouvrez une nouvelle connexion avec les nouvelles informations de connexion
            const newDatabaseConfig = config[configLabel];
            sequelize = new Sequelize(newDatabaseConfig.database, newDatabaseConfig.username, newDatabaseConfig.password, newDatabaseConfig.options);

            // Réinitialisez les modèles avec la nouvelle connexion
            // Ceci est une opération simplifiée et peut nécessiter des ajustements en fonction de votre configuration
            db.sequelize = sequelize;
            db.models = require('./models')(sequelize, Sequelize);

            res.status(200).json({ message: 'Database changed successfully.' });
        } catch (error) {
            console.error('Error changing database:', error);
            res.status(500).json({ error: 'Failed to change database.' });
        }

    }
}
