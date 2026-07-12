const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'transitops-secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, errors: ['missing authorization'] });
  
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ success: false, errors: ['invalid authorization format'] });
  
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, errors: ['invalid token'] });
  }
}

function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, errors: ['not authenticated'] });
    }
    
    // Admin role bypasses all checks
    if (req.user.roles === 'Admin') {
      return next();
    }
    
    if (allowedRoles.includes(req.user.roles)) {
      return next();
    }
    
    return res.status(403).json({ success: false, errors: ['Access denied: insufficient permissions'] });
  };
}

module.exports = {
  authMiddleware,
  checkRole
};
