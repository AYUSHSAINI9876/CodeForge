const jwt = require("jsonwebtoken");

function extractToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session. Please sign in again." });
  }
}

// Decodes the token if present, but never blocks the request — used on routes
// that are publicly readable but behave differently for the owner (e.g. a
// repo's visibility, or whether "you" are following a profile).
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = decoded.id;
    } catch (err) {
      // Ignore invalid/expired tokens on optional routes; treat as anonymous.
    }
  }
  next();
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuth = optionalAuth;
