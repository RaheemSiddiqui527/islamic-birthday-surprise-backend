import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser.js';
import { config } from '../config/index.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check HttpOnly cookie
    if (req.cookies && req.cookies[config.cookie.name]) {
      token = req.cookies[config.cookie.name];
    }
    // Check Authorization header as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify admin user exists in database
    const user = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.clearCookie(config.cookie.name);
      return res.status(401).json({
        success: false,
        error: 'Invalid session. User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie(config.cookie.name);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
}
