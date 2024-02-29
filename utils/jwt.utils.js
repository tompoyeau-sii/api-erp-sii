const jwt = require("jsonwebtoken");

const JWT_SIGN_SECRET =
  "9tBWmbCVlB9Q5NgKNfpYzubTOk5sQLHiBQR4atMCctRQhIkLj8rkd6LiUgmFtNE";

function generateTokenForAccount(accountData) {
  return jwt.sign(
    {
      accountId: accountData.id,
    },
    JWT_SIGN_SECRET,
    {
      expiresIn: "2h",
    }
  );
}

function verifyToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ error: "Votre token de connexion est manquant." });
  }

  const token = authorizationHeader.split(" ")[1];

  jwt.verify(token, JWT_SIGN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Session expiré, veuillez vous reconnecter." });
      }
      return res.status(401).json({ error: "Token de session invalide." });
    }
    req.accountId = decoded.accountId;
    next();
  });
}

module.exports = {
  generateTokenForAccount,
  verifyToken,
};
