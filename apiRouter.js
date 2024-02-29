const express = require("express");
const { verifyToken } = require("./utils/jwt.utils");

const accountController = require("./controller/accountController");
const associateController = require("./controller/associateController");
const customerController = require("./controller/customerController");
const genderController = require("./controller/genderController");
const graduationController = require("./controller/graduationController");
const jobController = require("./controller/jobController");
const projectController = require("./controller/projectController");
const missionController = require("./controller/missionController");
const pdcController = require("./controller/pdcController");
const statController = require("./controller/statController");
const environmentController = require("./controller/environmentController");

exports.router = (function () {
  const apiRouter = express.Router();


  //Configuration swagger avec token
  /**
   * @swagger
   * components:
   *   securitySchemes:
   *     JWTAuth:
   *       type: http
   *       scheme: bearer
   */

  /**
   * @swagger
   * security:
   *   - JWTAuth: []
   */

  //Account routes
  /**
   * @swagger
   * tags:
   *   name: Account
   *   description: Account Controller
   */

  /**
 * @swagger
 * /api/login/:
 *   post:
 *     summary: Connectez-vous
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Connexion réussie
 *       '400':
 *         description: Erreur de validation des données
 *       '403':
 *         description: Identifiants incorrects
 *       '404':
 *         description: Compte non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/login/").post(accountController.login);

  //Les routes qui suivent ont besoins d'un token pour être appelé
  apiRouter.use(verifyToken);

  /**
  * @swagger
  * /api/register/:
  *   post:
  *     summary: Créer un compte
  *     tags: [Account]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               username:
  *                 type: string
  *               password:
  *                 type: string
  *     security:
  *       - JWTAuth: []
  *     responses:
  *       '201':
  *         description: Compte créé avec succès
  *       '400':
  *         description: Erreur de validation des données
  *       '409':
  *         description: Le compte existe déjà
  *       '500':
  *         description: Erreur interne du serveur
  */
  apiRouter.route("/register/").post(accountController.register);

  //Associate routes
  /**
    * @swagger
    * tags:
    *   name: Associate
    *   description: API pour la gestion des associés
    */

  /**
     * @swagger
     * /api/associate:
     *   post:
     *     summary: Créer un associé
     *     tags: [Associate]
     *     security:
     *       - JWTAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               first_name:
     *                 type: string
     *               birthdate:
     *                 type: string
     *                 format: date
     *               mail:
     *                 type: string
     *                 format: email
     *               start_date:
     *                 type: string
     *                 format: date-time
     *               graduation_id:
     *                 type: integer
     *               job_id:
     *                 type: integer
     *               gender:
     *                 type: integer
     *               pru:
     *                 type: number
     *               manager_id:
     *                 type: integer
     *     responses:
     *       '201':
     *         description: Associé créé avec succès
     *       '400':
     *         description: Requête invalide
     *       '409':
     *         description: L'associé existe déjà
     *       '500':
     *         description: Erreur interne du serveur
     */
  apiRouter.route("/associate").post(associateController.create)
  /**
   * @swagger
   * /api/associates:
   *   get:
   *     summary: Récupérer tous les associés
   *     tags: [Associate]
   *     security:
   *       - JWTAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Numéro de page pour la pagination
   *     responses:
   *       '200':
   *         description: Liste des associés récupérée avec succès
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/associates").get(associateController.findAllWithLimit)
  /**
 * @swagger
 * /api/associate/{id}:
 *   get:
 *     summary: Récupérer un associé par son identifiant
 *     tags: [Associate]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'associé
 *     responses:
 *       '200':
 *         description: Associé récupéré avec succès
 *       '404':
 *         description: Associé non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/associate/:id").get(associateController.findById);
  /**
 * @swagger
 * /api/associate/{id}:
 *   put:
 *     summary: Mettre à jour un associé
 *     tags: [Associate]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'associé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *               mail:
 *                 type: string
 *                 format: email
 *               graduation_id:
 *                 type: integer
 *               job_id:
 *                 type: integer
 *               gender:
 *                 type: integer
 *               pru:
 *                 type: number
 *               manager_id:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Associé mis à jour avec succès
 *       '400':
 *         description: Requête invalide
 *       '404':
 *         description: Associé non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/associate/update/:id").put(associateController.update);
  /**
 * @swagger
 * /api/associate/{name}:
 *   get:
 *     summary: Récupérer un associé par son nom
 *     tags: [Associate]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de l'associé
 *     responses:
 *       '200':
 *         description: Associé récupéré avec succès
 *       '404':
 *         description: Associé non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/associates/managers").get(associateController.findManager);
  /**
 * @swagger
 * /api/associate/manager:
 *   get:
 *     summary: Récupérer tous les managers
 *     tags: [Associate]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '200':
 *         description: Liste des managers récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/associates/all").get(associateController.findAll);

  //Customer routes
  /**
     * @swagger
     * tags:
     *   name: Customer
     *   description: API pour la gestion des clients
     */

  /**
   * @swagger
   * /api/customer:
   *   post:
   *     summary: Créer un client
   *     tags: [Customer]
   *     security:
   *       - JWTAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label:
   *                 type: string
   *     responses:
   *       '201':
   *         description: Client créé avec succès
   *       '400':
   *         description: Requête invalide
   *       '409':
   *         description: Le client existe déjà
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/customer").post(customerController.create);
  /**
   * @swagger
   * /api/customers:
   *   get:
   *     summary: Récupérer tous les clients
   *     tags: [Customer]
   *     security:
   *       - JWTAuth: []
   *     responses:
   *       '200':
   *         description: Liste des clients récupérée avec succès
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/customers").get(customerController.findAll);
  /**
   * @swagger
   * /api/customer/{id}:
   *   get:
   *     summary: Récupérer un client par ID
   *     tags: [Customer]
   *     security:
   *       - JWTAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID du client à récupérer
   *         schema:
   *           type: integer
   *     responses:
   *       '200':
   *         description: Client récupéré avec succès
   *       '404':
   *         description: Client non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/customer/:id").get(customerController.findById);
  /**
   * @swagger
   * /api/customer/update/{id}:
   *   put:
   *     summary: Mettre à jour un client par ID
   *     tags: [Customer]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID du client à mettre à jour
   *         schema:
   *           type: integer
   *     security:
   *       - JWTAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label:
   *                 type: string
   *     responses:
   *       '200':
   *         description: Client mis à jour avec succès
   *       '400':
   *         description: Requête invalide
   *       '404':
   *         description: Client non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/customer/update/:id").put(customerController.update);

  //environment routes
  /**
    * @swagger
    * tags:
    *   name: Environment
    *   description: API pour la gestion des Environment
    */

  /**
 * @swagger
 * /api/environment/refresh:
 *   post:
 *     summary: Rafraîchir la simulation
 *     tags: [Environment]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '200':
 *         description: Simulation mise à jour avec succès
 *       '500':
 *         description: Erreur interne du serveur lors de la mise à jour de la simulation
 */
  apiRouter.route("/simulation/refresh").get(environmentController.refreshSimulation)

  //Gender routes
  /**
  * @swagger
  * tags:
  *   name: Gender
  *   description: API pour la gestion des Gender
  */

  /**
 * @swagger
 * /api/gender:
 *   post:
 *     summary: Créer un nouveau genre
 *     tags: [Gender]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Genre créé avec succès
 *       '400':
 *         description: Requête invalide
 *       '409':
 *         description: Le genre existe déjà
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/gender").post(genderController.create)
  /**
 * @swagger
 * /api/gender:
 *   get:
 *     summary: Récupérer tous les genres
 *     tags: [Gender]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Liste des genres récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/genders").get(genderController.findAll)


  //Job routes
  /**
   * @swagger
   * tags:
   *   name: Job
   *   description: API pour la gestion des Job
   */

  /**
 * @swagger
 * /api/job:
 *   post:
 *     summary: Créer un nouveau poste
 *     tags: [Job]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Poste créé avec succès
 *       '400':
 *         description: Requête invalide
 *       '409':
 *         description: Le poste existe déjà
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/job").post(jobController.create)
  /**
 * @swagger
 * /api/job:
 *   get:
 *     summary: Récupérer tous les postes
 *     tags: [Job]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Liste des postes récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/jobs").get(jobController.findAll)


  //graduation routes
  /**
 * @swagger
 * tags:
 *   name: Graduation
 *   description: API pour la gestion des Graduation
 */
  /**
 * @swagger
 * /api/graduation:
 *   post:
 *     summary: Créer une nouvelle graduation
 *     tags: [Graduation]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Graduation créée avec succès
 *       '400':
 *         description: Requête invalide
 *       '409':
 *         description: La graduation existe déjà
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/graduation").post(graduationController.create)
  /**
 * @swagger
 * /api/graduation:
 *   get:
 *     summary: Récupérer toutes les graduations
 *     tags: [Graduation]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Liste des graduations récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/graduations").get(graduationController.findAll)


  //mission routes
  /**
    * @swagger
    * tags:
    *   name: Mission
    *   description: API pour la gestion des Mission
    */

  /**
   * @swagger
   * /api/mission:
   *   post:
   *     summary: Créer une nouvelle mission
   *     tags: [Mission]
   *     security:
   *       - JWTAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label:
   *                 type: string
   *               associate_id:
   *                 type: integer
   *               project_id:
   *                 type: integer
   *               tjm:
   *                 type: number
   *               start_date:
   *                 type: string
   *                 format: date
   *               end_date:
   *                 type: string
   *                 format: date
   *     responses:
   *       '201':
   *         description: Mission créée avec succès
   *       '400':
   *         description: Requête invalide
   *       '404':
   *         description: Collaborateur non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/mission").post(missionController.create)
  /**
  * @swagger
  * /api/mission/{id}:
  *   put:
  *     summary: Mettre à jour une mission existante
  *     tags: [Mission]
  *     security:
  *       - JWTAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         description: Identifiant de la mission à mettre à jour
  *         schema:
  *           type: integer
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               tjm:
  *                 type: number
  *               start_date:
  *                 type: string
  *                 format: date
  *               end_date:
  *                 type: string
  *                 format: date
  *     responses:
  *       '201':
  *         description: Mission mise à jour avec succès
  *       '400':
  *         description: Requête invalide
  *       '500':
  *         description: Erreur interne du serveur
  */
  apiRouter.route("/mission/update/:id").put(missionController.update);
  /**
  * @swagger
  * /api/mission:
  *   get:
  *     summary: Récupérer toutes les missions
  *     tags: [Mission]
  *     security:
  *       - JWTAuth: []
  *     responses:
  *       '201':
  *         description: Liste des missions récupérée avec succès
  *       '500':
  *         description: Erreur interne du serveur
  */
  apiRouter.route("/missions").get(missionController.findAll)

  //pdc routes

  /**
    * @swagger
    * tags:
    *   name: PDC
    *   description: API pour la gestion des Pdc
    */
  /**
   * @swagger
   * /api/pdc:
   *   post:
   *     summary: Créer un plan de charge (PDC)
   *     tags: [PDC]
   *     security:
   *       - JWTAuth: []
   *     parameters:
   *       - in: query
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *         description: Année pour laquelle créer le plan de charge
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche de collaborateurs par nom et prénom
   *       - in: query
   *         name: manager
   *         schema:
   *           type: string
   *         description: Filtre par nom et prénom du manager
   *       - in: query
   *         name: customer
   *         schema:
   *           type: string
   *         description: Filtre par nom du client
   *       - in: query
   *         name: project
   *         schema:
   *           type: string
   *         description: Filtre par nom du projet
   *     responses:
   *       '201':
   *         description: Plan de charge créé avec succès
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/pdc").get(pdcController.createPDC)
  /**
 * @swagger
 * /api/pdc/year:
 *   get:
 *     summary: Récupérer l'année du plan de charge (PDC)
 *     tags: [PDC]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Année du plan de charge récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/pdc/year").get(pdcController.getPdcYear)
  /**
 * @swagger
 * /api/pdc/year:
 *   put:
 *     summary: Mettre à jour l'année du plan de charge (PDC)
 *     tags: [PDC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Année du plan de charge mise à jour avec succès
 *       '400':
 *         description: Requête invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/pdc/year").put(pdcController.updatePDCYear);

  //project routes
  /**
* @swagger
* tags:
*   name: Project
*   description: API pour la gestion des Project
*/
  /**
   * @swagger
   * /api/project:
   *   post:
   *     summary: Créer un nouveau projet
   *     tags: [Project]
   *     security:
   *       - JWTAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label:
   *                 type: string
   *               adv:
   *                 type: string
   *               customer_id:
   *                 type: integer
   *     responses:
   *       '201':
   *         description: Projet créé avec succès
   *       '400':
   *         description: Requête invalide
   *       '409':
   *         description: Le projet existe déjà
   *       '500':
   *         description: Erreur interne du serveur
   */
  apiRouter.route("/project").post(projectController.create)
  /**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Récupérer tous les projets
 *     tags: [Project]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '201':
 *         description: Liste des projets récupérée avec succès
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/projects").get(projectController.findAll)

  //statistiques routes
  /**
    * @swagger
    * tags:
    *   name: Statistique
    *   description: API pour la gestion des Statistique
    */

  /**
     * @swagger
     * /api/statistiques/manager:
     *   get:
     *     summary: Calculer les statistiques pour un manager donné
     *     tags: [Statistique]
     *     security:
     *       - JWTAuth: []
     *     parameters:
     *       - in: query
     *         name: year
     *         schema:
     *           type: integer
     *         required: true
     *         description: Année pour laquelle calculer les statistiques
     *       - in: query
     *         name: manager
     *         schema:
     *           type: integer
     *         required: true
     *         description: Identifiant du manager pour lequel calculer les statistiques
     *     responses:
     *       '201':
     *         description: Statistiques calculées avec succès
     *       '400':
     *         description: Requête invalide
     *       '500':
     *         description: Erreur interne du serveur
     */
  apiRouter.route("/statistiques/manager").get(statController.calculateStatsManager)
  /**
 * @swagger
 * /api/statistiques/agence:
 *   get:
 *     summary: Calculer les statistiques pour une agence
 *     tags: [Statistique]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Année pour laquelle calculer les statistiques
 *     responses:
 *       '201':
 *         description: Statistiques calculées avec succès
 *       '400':
 *         description: Requête invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/statistiques/agence").get(statController.calculateStatsAgence)
  /**
 * @swagger
 * /api/statistiques/customer:
 *   get:
 *     summary: Calculer les statistiques pour un client donné
 *     tags: [Statistique]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: query
 *         name: customer
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifiant du client pour lequel calculer les statistiques
 *     responses:
 *       '201':
 *         description: Statistiques calculées avec succès
 *       '400':
 *         description: Requête invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
  apiRouter.route("/statistiques/customer").get(statController.calculateStatsCustomer)
  /**
    * @swagger
    * /api/statistiques/customer/actual-month:
    *   get:
    *     summary: Calculer les statistiques pour le client actuel pour le mois en cours
    *     tags: [Statistique]
    *     security:
    *       - JWTAuth: []
    *     responses:
    *       '201':
    *         description: Statistiques calculées avec succès
    *       '400':
    *         description: Requête invalide
    *       '500':
    *         description: Erreur interne du serveur
    */
  apiRouter.route("/statistiques/customer/actualMonth").get(statController.calculateStatsCustomerActualMonth)



  return apiRouter;
})();
