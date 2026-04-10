// ============================================================
// FlightZone AI — JWT Auth Middleware
// Task 3.6 — middleware/authMiddleware.js
// ============================================================
const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT from Authorization: Bearer <token>.
 * On success, attaches req.user = { userId, role, name }.
 * Returns 401 if token is missing or invalid.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Role-based access guard factory.
 * Usage: router.get('/admin/users', authMiddleware, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
