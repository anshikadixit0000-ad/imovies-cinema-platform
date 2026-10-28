const jwt = require('jsonwebtoken');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_imovies_jwt_token_key_2026_xyz!@#';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    if (getIsConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = await memoryStore.findById('users', decoded.id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly, JWT_SECRET };
