import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized', status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized', status: 401 });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', status: 401 });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized', status: 401 });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden', status: 403 });
    }
    next();
  };
};

export const requireApproved = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized', status: 401 });
  if (req.user.role === 'expert' && !req.user.isApproved) {
    return res.status(403).json({ message: 'Your account is pending admin approval.', status: 403 });
  }
  next();
};
