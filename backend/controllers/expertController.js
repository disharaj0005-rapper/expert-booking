import Expert from '../models/Expert.js';
import Review from '../models/Review.js';

export const getExperts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const { category, search, minRating, maxPrice, availability, sortBy } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search.trim(), $options: 'i' };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (maxPrice) filter.hourlyRate = { $lte: parseFloat(maxPrice) };

    if (availability === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filter['availableSlots.date'] = today;
      filter['availableSlots.isBooked'] = false;
    } else if (availability === 'this_week') {
      const today = new Date();
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        week.push(d.toISOString().split('T')[0]);
      }
      filter['availableSlots.date'] = { $in: week };
      filter['availableSlots.isBooked'] = false;
    }

    let sort = {};
    if (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'price') sort = { hourlyRate: 1 };
    else if (sortBy === 'experience') sort = { experience: -1 };

    const total = await Expert.countDocuments(filter);
    const experts = await Expert.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      data: experts.map(e => ({
        _id: e._id,
        name: e.name,
        category: e.category,
        experience: e.experience,
        rating: e.rating,
        hourlyRate: e.hourlyRate,
        availableSlots: e.availableSlots
      }))
    });
  } catch (err) {
    next(err);
  }
};

export const getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id).lean();
    if (!expert) {
      const err = new Error('Expert not found');
      err.status = 404;
      return next(err);
    }
    const reviews = await Review.find({ expertId: expert._id }).populate('userId', 'name').sort({ createdAt: -1 }).lean();
    res.json({ ...expert, reviews });
  } catch (err) {
    next(err);
  }
};

export const updateExpert = async (req, res, next) => {
  try {
    const expert = await Expert.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!expert) {
      const err = new Error('Expert profile not found');
      err.status = 404;
      return next(err);
    }
    res.json(expert);
  } catch (err) {
    next(err);
  }
};

export const addSlot = async (req, res, next) => {
  try {
    const { date, time, repeatWeekly } = req.body;
    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const slotsToAdd = [];
    if (repeatWeekly) {
      for (let i = 0; i < 4; i++) {
        const d = new Date(date);
        d.setDate(d.getDate() + i * 7);
        const ds = d.toISOString().split('T')[0];
        const exists = expert.availableSlots.some(s => s.date === ds && s.time === time);
        if (!exists) slotsToAdd.push({ date: ds, time, isBooked: false });
      }
    } else {
      const exists = expert.availableSlots.some(s => s.date === date && s.time === time);
      if (!exists) slotsToAdd.push({ date, time, isBooked: false });
    }

    expert.availableSlots.push(...slotsToAdd);
    await expert.save();
    res.status(201).json({ added: slotsToAdd.length, slots: expert.availableSlots });
  } catch (err) {
    next(err);
  }
};

export const deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const slot = expert.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ message: 'Cannot delete a booked slot' });

    expert.availableSlots.pull(slotId);
    await expert.save();
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    next(err);
  }
};

export const getExpertDashboard = async (req, res, next) => {
  try {
    const expert = await Expert.findOne({ userId: req.user._id }).lean();
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const today = new Date().toISOString().split('T')[0];
    const Booking = (await import('../models/Booking.js')).default;
    const bookings = await Booking.find({ expertId: expert._id }).populate('userId', 'name').sort({ createdAt: -1 }).lean();

    const upcoming = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
    const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');

    res.json({
      stats: {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completedToday: todayBookings.filter(b => b.status === 'completed').length
      },
      upcoming: upcoming.slice(0, 20)
    });
  } catch (err) {
    next(err);
  }
};
