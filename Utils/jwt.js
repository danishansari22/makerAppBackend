const jwt = require('jsonwebtoken');

// Generate a JWT token
const generateToken = (payload) => {
  const token = jwt.sign(payload, 'buildbeyondreality');
  return token;
};

// Verify JWT token
const verifyToken = (authorizationToken) => {
  

  if (!authorizationToken) {
    return "No token provided"
  }

  const verified =   jwt.verify(authorizationToken, 'buildbeyondreality', (err, decoded) => {
    return decoded;
  });
  console.log(verified,"verified");
  return verified;
};

module.exports = {
  generateToken,
  verifyToken,
};
