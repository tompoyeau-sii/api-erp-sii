const jwt = require("jsonwebtoken");

const JWT_SIGN_SECRET =
  "9tBWmbCVlB9Q5NgKNfpYzubTOk5sQLHiBQR4atMCctRQhIkLj8rkd6LiUgmFtNE";

module.exports = {
  generateTokenForAccount: function (accountData) {
    return jwt.sign(
      {
        accountId: accountData.id,
      },
      JWT_SIGN_SECRET,
      {
        expiresIn: "10s",
      }
    );
  },
};
