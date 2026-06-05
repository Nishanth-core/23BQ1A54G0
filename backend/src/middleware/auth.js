const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid Authorization format' } });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // support claim names like sub, userId, id
    req.user = { id: payload.sub || payload.userId || payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
};

module.exports = auth;
