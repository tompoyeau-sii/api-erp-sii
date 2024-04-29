const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const db = require("../../models").production.models;
const { format } = require('date-fns');
const cheminPgDump = '"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe"';
const cheminPsql = '"C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe"';
const motDePasse = 'root';

process.env.PGPASSWORD = motDePasse;

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

module.exports = {
    ProdToSimu: function (req, res) {
        const userId = req.body.userId;

        db.Account.findOne({
            where:
            {
                id: userId
            }
        }).then(user => {

            const basename = "picsou-" + removeAccents(user.name.toLowerCase())
            // Obtenez la date et l'heure actuelles
            const now = new Date();
            const dateHeure = now.toISOString().replace(/[-:]/g, '').replace('T', '_').replace(/\..+/, '');

            // Nom du fichier de sauvegarde basé sur la date et l'heure
            const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', 'Prod', `sauvegarde_picsou_${dateHeure}.sql`);

            // Exécute la commande pour exporter les données de la base de données A
            fs.writeFileSync(nomFichierSauvegarde, '');
            exec(`${cheminPgDump} -U postgres -d picsou > ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur lors de l'exportation des données: ${error}`);
                    res.status(500).json({ message: "Erreur lors de l'exportation des données." });
                    return;
                }

                // Exécute la commande pour supprimer le schéma public de la base de données B
                exec(`${cheminPsql} -U postgres -d ${basename} -c "DROP SCHEMA IF EXISTS public CASCADE"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erreur lors de la suppression du schéma public: ${error}`);
                        res.status(500).json({ message: "Erreur lors de la suppression du schéma public." });
                        return;
                    }

                    // Exécute la commande pour recréer le schéma public dans la base de données B
                    exec(`${cheminPsql} -U postgres -d ${basename} -c "CREATE SCHEMA public"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erreur lors de la recréation du schéma public: ${error}`);
                            res.status(500).json({ message: "Erreur lors de la recréation du schéma public." });
                            return;
                        }

                        // Exécute la commande pour importer les données dans la base de données B
                        exec(`${cheminPsql} -U postgres -d ${basename} -f ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Erreur lors de l'importation des données: ${error}`);
                                res.status(500).json({ message: "Erreur lors de l'importation des données." });
                                return;
                            }

                            console.log(`Transfert de données réussi ! Fichier de sauvegarde : ${nomFichierSauvegarde}`);
                            res.status(200).json({ message: "Transfert de données réussi !" });
                        });
                    });
                });
            });
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: "Erreur lors de la récupération de l'identifiant du compte" });
        })
    },
    CreateSave: function (req, res) {
        const userId = req.body.userId;
        const fileName = req.body.fileName; // Assurez-vous que le titre du fichier est envoyé dans le corps de la requête

        db.Account.findOne({
            where: {
                id: userId
            }
        }).then(user => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            let username = user.first_name.toLowerCase() + "." + user.name.toLowerCase();
            let basename = "picsou-" + user.name.toLowerCase();
            username = removeAccents(username)
            basename = removeAccents(basename)

            if (!fileName) {
                return res.status(400).json({ message: "Le titre du fichier est requis." });
            }

            // Nom du fichier de sauvegarde basé sur le titre et l'heure actuelle
            const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', `${username}`, `${fileName}.sql`);

            // Vérifie si un fichier du même nom existe déjà
            if (fs.existsSync(nomFichierSauvegarde)) {
                return res.status(409).json({ error: "Une version du même nom existe déjà." });
            }

            // Exécute la commande pour exporter les données de la base de données A
            fs.writeFileSync(nomFichierSauvegarde, '');
            exec(`${cheminPgDump} -U postgres -d ${basename} > ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur lors de l'exportation des données: ${error}`);
                    return res.status(500).json({ message: "Erreur lors de l'exportation des données." });
                }

                console.log(`Transfert de données réussi ! Fichier de sauvegarde : ${nomFichierSauvegarde}`);
                res.status(200).json({ message: "Création de la sauvegarde " + fileName + " réussi !" });
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: "Erreur lors de la récupération de l'identifiant du compte" });
        });
    },
    SaveProd: function (req, res) {
        // Obtenez la date et l'heure actuelles
        const now = new Date();
        const dateHeure = now.toISOString().replace(/[-:]/g, '').replace('T', '_').replace(/\..+/, '');

        // Nom du fichier de sauvegarde basé sur la date et l'heure
        const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', 'Prod', `sauvegarde_picsou_${dateHeure}.sql`);

        // Exécute la commande pour exporter les données de la base de données A
        fs.writeFileSync(nomFichierSauvegarde, '');
        exec(`${cheminPgDump} -U postgres -d picsou > ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors de l'exportation des données: ${error}`);
                res.status(500).json({ message: "Erreur lors de l'exportation des données." });
                return;
            }
            console.log(`Sauvegarde créer ! Fichier de sauvegarde : ${nomFichierSauvegarde}`);
            res.status(200).json({ message: "Sauvegarde réussie !" });
        });

    },
    LoadSave: function (req, res) {
        const userId = req.body.userId;
        const fileName = req.body.fileName; // Assurez-vous que le titre du fichier est envoyé dans le corps de la requête

        db.Account.findOne({
            where:
            {
                id: userId
            }
        }).then(user => {
            let username = user.first_name + "." + user.name
            let basename = "picsou-" + user.name.toLowerCase()
            username = removeAccents(username)
            basename = removeAccents(basename)

            if (!fileName) {
                return res.status(400).json({ message: "Le titre du fichier est requis." });
            }

            // Nom du fichier de sauvegarde basé sur le titre et l'heure actuelle
            const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', `${username}`, `${fileName}.sql`);

            // Exécute la commande pour supprimer le schéma public de la base de données B
            exec(`${cheminPsql} -U postgres -d ${basename} -c "DROP SCHEMA IF EXISTS public CASCADE"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur lors de la suppression du schéma public: ${error}`);
                    res.status(500).json({ message: "Erreur lors de la suppression du schéma public." });
                    return;
                }

                // Exécute la commande pour recréer le schéma public dans la base de données B
                exec(`${cheminPsql} -U postgres -d ${basename} -c "CREATE SCHEMA public"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erreur lors de la recréation du schéma public: ${error}`);
                        res.status(500).json({ message: "Erreur lors de la recréation du schéma public." });
                        return;
                    }

                    // Exécute la commande pour importer les données dans la base de données B
                    exec(`${cheminPsql} -U postgres -d ${basename} -f ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erreur lors de l'importation des données: ${error}`);
                            res.status(500).json({ message: "Erreur lors de l'importation des données." });
                            return;
                        }

                        console.log(`Fichier ${nomFichierSauvegarde} chargé avec succès`);
                        res.status(200).json({ message: `Fichier ${fileName} chargé avec succès` });
                    });
                });
            });

        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: "Erreur lors de la récupération de l'identifiant du compte" });
        })
    },
    LoadSaveFromOtherUser: function (req, res) {
        const userId = req.body.userId;
        const otherUserId = req.body.otherUserId;
        const fileName = req.body.fileName; // Assurez-vous que le titre du fichier est envoyé dans le corps de la requête

        db.Account.findOne({
            where:
            {
                id: userId
            }
        }).then(user => {
            db.Account.findOne({
                where:
                {
                    id: otherUserId
                }
            }).then(otherUser => {
                let basename = "picsou-" + user.name.toLowerCase()
                let otherUsername = otherUser.first_name + "." + otherUser.name
                basename = removeAccents(basename)
                otherUsername = removeAccents(otherUsername)


                if (!fileName) {
                    return res.status(400).json({ message: "Le titre du fichier est requis." });
                }

                // Nom du fichier de sauvegarde basé sur le titre 
                const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', `${otherUsername}`, `${fileName}.sql`);

                // Exécute la commande pour supprimer le schéma public de la base de données B
                exec(`${cheminPsql} -U postgres -d ${basename} -c "DROP SCHEMA IF EXISTS public CASCADE"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erreur lors de la suppression du schéma public: ${error}`);
                        res.status(500).json({ message: "Erreur lors de la suppression du schéma public." });
                        return;
                    }

                    // Exécute la commande pour recréer le schéma public dans la base de données B
                    exec(`${cheminPsql} -U postgres -d ${basename} -c "CREATE SCHEMA public"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erreur lors de la recréation du schéma public: ${error}`);
                            res.status(500).json({ message: "Erreur lors de la recréation du schéma public." });
                            return;
                        }

                        // Exécute la commande pour importer les données dans la base de données B
                        exec(`${cheminPsql} -U postgres -d ${basename} -f ${nomFichierSauvegarde}`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Erreur lors de l'importation des données: ${error}`);
                                res.status(500).json({ message: "Erreur lors de l'importation des données." });
                                return;
                            }

                            console.log(`Fichier ${nomFichierSauvegarde} chargé avec succès`);
                            res.status(200).json({ message: `Fichier ${fileName} chargé avec succès` });
                        });
                    });
                });

            }).catch(err => {
                console.log(err)
                return res.status(500).json({ error: "Erreur lors de la récupération de l'identifiant du compte" });
            })
        })
    },
    GetFiles: function (req, res) {
        const userId = req.params.id; // Récupérer l'ID utilisateur depuis le corps de la requête

        // Vérifier si l'ID utilisateur est présent dans le corps de la requête
        if (!userId) {
            return res.status(400).json({ error: 'ID utilisateur non fourni dans la requête.' });
        }

        const page = req.query.page ? parseInt(req.query.page) : 1; // Récupérer le numéro de la page depuis la requête
        const pageSize = 5; // Nombre de fichiers par page

        db.Account.findOne({
            where: {
                id: userId
            }
        }).then(user => {
            let username = user.first_name + "." + user.name;
            username = removeAccents(username)
            const directoryPath = path.join(__dirname, '..', '..', 'saveBDD', `${username.toLowerCase()}`); // Chemin du répertoire saveBDD
            fs.readdir(directoryPath, function (err, files) {
                // Gérer les erreurs liées à la lecture du répertoire
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la lecture du répertoire.' });
                }

                const totalFiles = files.length;
                const totalPages = Math.ceil(totalFiles / pageSize);
                const startIndex = (page - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, totalFiles);

                const fileData = [];
                // Boucler à travers les fichiers du répertoire
                for (let i = startIndex; i < endIndex; i++) {
                    const file = files[i];
                    const filePath = path.join(directoryPath, file);
                    const stats = fs.statSync(filePath);
                    const fileInfo = path.parse(file);
                    const fileNameWithoutExtension = fileInfo.name;
                    const formattedCreationDate = format(stats.birthtime, 'dd/MM/yyyy HH:mm');

                    fileData.push({
                        name: fileNameWithoutExtension,
                        created_at: formattedCreationDate // Date de création du fichier formatée
                    });
                }

                // Trier les fichiers par date de création, du plus récent au plus ancien
                fileData.sort((a, b) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    if (dateA > dateB) return -1;
                    if (dateA < dateB) return 1;
                    return 0;
                });

                
                // Envoyer les données de la page actuelle
                res.json({
                    userId: userId,
                    files: fileData,
                    currentPage: page,
                    totalPages: totalPages
                });
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Erreur lors de la recherche de l\'utilisateur dans la base de données.' });
        });
    },
    DeleteSave: function (req, res) {
        const userId = req.body.userId;
        const fileName = req.body.fileName; // Assurez-vous que le titre du fichier est envoyé dans le corps de la requête

        db.Account.findOne({
            where: {
                id: userId
            }
        }).then(user => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            let username = user.first_name + "." + user.name;
            username = removeAccents(username.toLowerCase())
            console.log(username)

            if (!fileName) {
                return res.status(400).json({ message: "Le titre du fichier est requis." });
            }

            // Nom du fichier de sauvegarde basé sur le titre
            const nomFichierSauvegarde = path.join(__dirname, '..', '..', 'saveBDD', `${username}`, `${fileName}.sql`);

            // Vérifier si le fichier existe
            if (!fs.existsSync(nomFichierSauvegarde)) {
                console.log("fichier de sauvegarde introuvable")
                return res.status(404).json({ error: "Fichier de sauvegarde non trouvé." });
            }

            // Supprimer le fichier
            fs.unlink(nomFichierSauvegarde, (err) => {
                if (err) {
                    console.error(`Erreur lors de la suppression du fichier : ${err}`);
                    return res.status(500).json({ message: "Erreur lors de la suppression du fichier." });
                }

                console.log(`Fichier ${nomFichierSauvegarde} supprimé avec succès.`);
                res.status(200).json({ message: `Fichier ${fileName} supprimé avec succès.` });
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: "Erreur lors de la récupération de l'identifiant du compte" });
        });
    }
};
