const models = require("../models");
const bcrypt = require("bcrypt");
const jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async')

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{8,16}$/

module.exports = {

  //Création d'un account
  register: function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // if (!EMAIL_REGEX.test(username)) {
    //   return res.status(400).json({ 'error': "Mail incorrect" });
    // }

    // if (!PASSWORD_REGEX.test(password)) {
    //   return res.status(400).json({ 'error': "Mot de passe incorrect" });
    // }
    models.Account.findOne({
      attributes: ["username"],
      where: { username: username },
    })
      .then(function (acccountFound) {
        if (!acccountFound) {
          bcrypt.hash(password, 5, function (err, brcyptedPassword) {
            const newAccount = models.Account.create({
              username: username,
              password: brcyptedPassword,
            })
              .then(function (newAccount) {
                return res.status(201).json({
                  accountId: newAccount.id,
                });
              })
              .catch(function (err) {
                return res.status(500).json({ 'error': "cannot add account" });
              });
          });
        } else {
          return res.status(409).json({ 'error': "account already exist" });
        }
      })
      .catch(function (err) {
        return res.status(500).json({ 'error': "unable to verify account" });
      });
  },

  // Login d'un account
  login: function (req, res) {

    // Params
    var username = req.body.username;
    var password = req.body.password;

    if (username == null) {
      return res.status(400).json({ 'error': 'Il manque un username' });
    }
      
    if (password == null) {
      return res.status(400).json({ 'error': 'Il manque un username' });
    }



    asyncLib.waterfall([
      function (done) {
        models.Account.findOne({
          where: { username: username }
        })
          .then(function (accountFound) {
            done(null, accountFound);
          })
          .catch(function (err) {
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
          'token': jwtUtils.generateTokenForAccount(accountFound)
        });
      } else {
        return res.status(500).json({ 'error': 'cannot log on account' });
      }
    });
  },

  findAll: function (req, res) {
    models.Account.findAll({
      attributes: ["id", "username"],
    })
      .then((account) => {
        return res.status(201).json({
          account,
        });
      })
      .catch((error) => console.error(error));
  },
};
