const { verifyToken } = require('../lib/jwt');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing Bearer token.' });
  }

  try {
    req.auth = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = {
  requireAuth,
};
