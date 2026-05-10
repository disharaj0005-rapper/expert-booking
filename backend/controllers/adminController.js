import User from '../models/User.js';
import Expert from '../models/Expert.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalExperts = await User.countDocuments({ role: 'expert' });
    const pendingExperts = await User.countDocuments({ role: 'expert', isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const today = new Date().toISOString().split('T')[0];
    const bookingsToday = await Booking.countDocuments({ date: today, status: { $ne: 'cancelled' } });

    res.json({
      totalUsers,
      totalExperts,
      pendingExperts,
      approvedExperts: totalExperts - pendingExperts,
      totalBookings,
      bookingsToday
    });
  } catch (err) {
    next(err);
  }
};

export const getAllExperts = async (req, res, next) => {
  try {
    const experts = await Expert.find().populate('userId', 'email isApproved').lean();
    res.json(experts);
  } catch (err) {
    next(err);
  }
};

export const approveExpert = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'expert' },
      { isApproved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Expert not found' });

    await Notification.create({
      userId: user._id,
      message: 'Your expert account has been approved!',
      type: 'expert_approved'
    });
    req.io.emit(`notification:${user._id}`, { message: 'Your expert account has been approved!' });

    res.json({ message: 'Expert approved', user });
  } catch (err) {
    next(err);
  }
};

export const deleteExpert = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'expert' });
    if (!user) return res.status(404).json({ message: 'Expert not found' });
    await Expert.findOneAndDelete({ userId: user._id });
    res.json({ message: 'Expert deleted' });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: { $ne: 'admin' } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, dateFrom, dateTo, expertId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (expertId) filter.expertId = expertId;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }
    const bookings = await Booking.find(filter)
      .populate('expertId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
