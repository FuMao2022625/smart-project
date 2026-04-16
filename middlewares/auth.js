const jwt = require('jsonwebtoken');
const winston = require('../config/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      winston.warn('Invalid token attempt:', err.message);
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }

    req.user = user;
    next();
  });
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role || 'user' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  authorize,
  generateToken
};
