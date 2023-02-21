const models = require("../models");
const bcrypt = require("bcrypt");
const jwtUtils = require('../utils/jwt.utils');

module.exports = {

  //Création d'un account
  register: function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (username == null || password == null) {
      return res.status(400).json({ 'error': "missing parameters" });
    }

    if (username.length >= 13 || username.length >= 13) {

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
    }
  },

  // Login d'un account
  login: function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (username == null || password == null) {
      return res.status(400).json({ 'error': "missing parameters" });
    }

    models.Account.findOne({
      where: { 'username': username },
    })
      .then(function (acccountFound) {
        if (acccountFound) {
          bcrypt.compare(
            password,
            acccountFound.password,
            function (errBycrypt, resBycrypt) {
              if (resBycrypt) {
                return res
                  .status(200)
                  .json({ 'accountID': acccountFound.id, 'token': jwtUtils.generateTokenForAccount(acccountFound) });
              } else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          );
        } else {
          return res.status(400).json({ 'error': "account not exist in DB" });
        }
      })
      .catch(function (err) {
        return res.status(400).json({ 'error': "unable to verify account" });
      });
  },
};
