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

    if (username == null || password == null) {
      return res.status(400).json({ 'error': "missing parameters" });
    }

    if (!EMAIL_REGEX.test(username)) {
      return res.status(400).json({ 'error': "username invalid" });

    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': "password invalid" });
    }

    asyncLib.waterfall([
      function (done) {
        models.Account.findOne({
          attributes: ['username'],
          where: { username: username }
        })
          .then(function (accoundFound) {
            done(null, accoundFound);
          })
          .catch(function (err) {
            return res.status(500).json({ 'error': 'unable to verify account' })
          })
      },
      //Vérification si le compte existe
      function (accoundFound, done) {
        if (!accoundFound) {
          bcrypt.hash(password, 5, function (err, bcryptedPassword) {
            done(null, accoundFound, bcryptedPassword);
          });
        } else {
          return res.status(409).json({ 'error': 'account already exist' })
        }
      },
      function (accoundFound, bcryptedPassword, done) {
        var newAccount = models.Account.create({
          username: accountname,
          password: password
        })
          .then(function (newAccount) {
            done(newAccount)
          })
          .catch(function (err) {
            return res.status(409).json({ 'error': 'cannot add account' })
          })
      }
    ],
      function (newAccount) {
        if (newAccount) {
          return res.status(201).json({
            'accoundId': newAccount.id
          })
        } else {
          return res.status(500).json({ 'error': 'cannot add account' })
        }
      }
    )
  },

  // Login d'un account
  login: function (req, res) {

    // Params
    var username = req.body.username;
    var password = req.body.password;

    if (username == null || password == null) {
      return res.status(400).json({ 'error': 'missing parameters' });
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
          return res.status(404).json({ 'error': 'Identifiants incorrect'});
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
};
