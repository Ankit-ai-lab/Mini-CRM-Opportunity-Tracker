const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by requiring a valid JWT in the Authorization header.
 * Format: Authorization: Bearer <token>
 * On success, attaches req.user = { id, name, email }
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Session expired, please log in again'
          : 'Not authorized, invalid token';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    // Identity is derived purely from the verified token / DB lookup —
    // never trust a user id sent in the request body.
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

module.exports = { protect };
