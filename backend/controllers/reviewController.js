import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Expert from '../models/Expert.js';

export const createReview = async (req, res, next) => {
  try {
    const { expertId, bookingId, rating, comment } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, userId, expertId, status: 'completed' });
    if (!booking) {
      const err = new Error('You can only review completed bookings');
      err.status = 400;
      return next(err);
    }

    const existing = await Review.findOne({ bookingId, userId });
    if (existing) {
      const err = new Error('You have already reviewed this booking');
      err.status = 409;
      return next(err);
    }

    const review = await Review.create({ expertId, bookingId, userId, rating, comment });

    const avg = await Review.aggregate([
      { $match: { expertId: typeof expertId === 'string' ? new mongoose.Types.ObjectId(expertId) : expertId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    if (avg.length > 0) {
      await Expert.findByIdAndUpdate(expertId, { rating: parseFloat(avg[0].avgRating.toFixed(1)) });
    }

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const getReviewsByExpert = async (req, res, next) => {
  try {
    const reviews = await Review.find({ expertId: req.params.expertId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
