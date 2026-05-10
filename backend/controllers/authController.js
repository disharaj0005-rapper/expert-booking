import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Expert from '../models/Expert.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'fallbacksecret';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, category, experience, bio, hourlyRate } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      return next(err);
    }
    const hashed = await bcrypt.hash(password, 10);
    const isExpert = role === 'expert';
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashed,
        role: isExpert ? 'expert' : 'user',
        isApproved: true
      });

      if (isExpert) {
        await Expert.create({
          userId: user._id,
          name,
          category: category || 'General',
          experience: experience || 1,
          rating: 0,
          bio: bio || '',
          hourlyRate: hourlyRate || 50,
          availableSlots: []
        });
      }

      res.status(201).json({
        message: 'Account created successfully!',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }
      });
    } catch (createErr) {
      if (user) await User.findByIdAndDelete(user._id);
      throw createErr;
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let expertProfile = null;
    if (user.role === 'expert') {
      expertProfile = await Expert.findOne({ userId: user._id }).lean();
    }
    res.json({ user, expertProfile });
  } catch (err) {
    next(err);
  }
};
