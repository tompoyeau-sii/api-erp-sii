const db = require("../../models").maillard.models;
const bcrypt = require("bcrypt");
const jwtUtils = require('../../utils/jwt.utils');
var asyncLib = require('async')

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{8,16}$/

module.exports = {

  //Création d'un account
  register: function (req, res) {
    const username = req.body.username;
    const first_name = req.body.first_name;
    const name = req.body.name;
    const password = req.body.password;

    // Vérifiaction que le format du mail est bien conformes aux attentes
    // if (!EMAIL_REGEX.test(username)) {
    //   return res.status(400).json({ 'error': "Mail inconforme" });
    // }
    // Vérifiaction que le format du mot de passe est bien conformes aux attentes
    // if (!PASSWORD_REGEX.test(password)) {
    //   return res.status(400).json({ 'error': "Mot de passe inconforme" });
    // }
    // On recherche si cette adresse mail existe déjà 
    db.Account.findOne({
      attributes: ["username"],
      where: { username: username },
    })
      .then(acccountFound => {
        // Si il n'existe pas alors on le créer en encryptant son mot de passe
        if (!acccountFound) {
          bcrypt.hash(password, 5, function (err, brcyptedPassword) {
            db.Account.create({
              username: username,
              first_name: first_name,
              name: name,
              password: brcyptedPassword,
            })
              .then(newAccount => {
                return res.status(201).json({
                  accountId: newAccount.id,
                });
              })
              .catch(err => {
                console.log(err);
                return res.status(500).json({ 'error': "Erreur lors de l'ajout du nouveau compte" });
              });
          });
          //Si le compte existe alors on renvoi un message d'erreur
        } else {
          return res.status(409).json({ 'error': "Un compte avec cet email existe déjà" });
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ 'error': "Erreur lors de la vérification du compte" });
      });
  },

  // Login d'un account
  login: function (req, res) {

    console.log(db)
    // Params
    var username = req.body.username;
    var password = req.body.password;
    
    // //Vérifiaction que le format du mail est bien conformes aux attentes
    // if (!EMAIL_REGEX.test(username)) {
    //   return res.status(400).json({ 'error': "Mail inconforme" });
    // }
    // //Vérifiaction que le format du mot de passe est bien conformes aux attentes
    // if (!PASSWORD_REGEX.test(password)) {
    //   return res.status(400).json({ 'error': "Mot de passe incorrect" });
    // }


    //On vérifie que les champs sont bien complétés
    if (username == null) {
      return res.status(400).json({ 'error': 'Mail manquant' });
    }
      
    if (password == null) {
      return res.status(400).json({ 'error': 'Mot de passe manquant' });
    }

    
    asyncLib.waterfall([
      function (done) {
        
        db.Account.findOne({
          where: { username: username }
        })
          .then(accountFound => {
            done(null, accountFound);
          })
          .catch(err => {
            console.log(err)
            return res.status(500).json({ 'error': "Impossible de se connecter. Si le problème persiste, contactez l'administrateur." });
          });
      },
      function (accountFound, done) {
        if (accountFound) {
          bcrypt.compare(password, accountFound.password, function (errBycrypt, resBycrypt) {
            done(null, accountFound, resBycrypt);
          });
        } else {
          return res.status(404).json({ 'error': 'Identifiants incorrect' });
        }
      },
      function (accountFound, resBycrypt, done) {
        if (resBycrypt) {
          done(accountFound);
        } else {
          return res.status(403).json({ 'error': 'Identifiants incorrect' });
        }
      }
    ], function (accountFound) {
      if (accountFound) {
        return res.status(201).json({
          'accountId': accountFound.id,
          'accountName': accountFound.first_name + " " + accountFound.name,
          'token': jwtUtils.generateTokenForAccount(accountFound)
        });
      } else {
        return res.status(500).json({
          'error': "Impossible de se connecter. Si le problème persiste, contactez l'administrateur." });
      }
    });
  },
  findAll: function (req, res) {
    db.Account.findAll({
      attributes: ['id', 'name', 'first_name'],
      order: [['name', 'ASC']],
    }).then(accounts => {
      // Transformation des données pour ajouter un attribut fullname
      const modifiedAccounts = accounts.map(account => {
        return {
          id: account.id,
          name: account.name,
          first_name: account.first_name,
          fullname: `${account.first_name} ${account.name}`
        };
      });

      return res.status(200).json({
        accounts: modifiedAccounts
      });
    }).catch(err => {
      console.error(err);
      return res.status(500).json({ error: "Erreur lors de la récupération des comptes" });
    });
  }


};
