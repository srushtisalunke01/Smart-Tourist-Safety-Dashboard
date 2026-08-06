const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  const secret = process.env.JWT_SECRET || 'safetour_secret_key_12345';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });

};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Standardise roles to lowercase for flexible validation
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  isAdmin
};
