// authMiddleware.js

const jwt = require('jsonwebtoken');

// Replace 'randomly_generated_secret_key_here' with your actual random secret key
const secretKey = 'f7e1c4a62e4965ad7e1c19a7f9a1b062e54a9d2c6b29d1c0b4925a4b8f1e2c6e';

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  const token = req.header('Authorization');

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, secretKey);

    // Attach the decoded user object to the request object for further use
    req.user = decoded.user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
