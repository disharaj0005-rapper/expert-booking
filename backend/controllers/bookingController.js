import Booking from '../models/Booking.js';
import Expert from '../models/Expert.js';
import Waitlist from '../models/Waitlist.js';
import Notification from '../models/Notification.js';

export const createBooking = async (req, res, next) => {
  try {
    const { expertId, name, email, phone, date, timeSlot, notes } = req.body;
    const userId = req.user._id;

    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'availableSlots.date': date,
        'availableSlots.time': timeSlot,
        'availableSlots.isBooked': false
      },
      { $set: { 'availableSlots.$.isBooked': true } },
      { new: true }
    );

    if (!expert) {
      const err = new Error('Slot already booked');
      err.status = 409;
      return next(err);
    }

    const booking = await Booking.create({
      expertId,
      userId,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes: notes || '',
      status: 'pending'
    });

    req.io.emit('slotBooked', { expertId, date, timeSlot });

    const populated = await Booking.findById(booking._id).populate('expertId', 'name');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    const bookings = await Booking.find({ email })
      .populate('expertId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('expertId', 'name');

    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      return next(err);
    }

    if (status === 'confirmed') {
      await Notification.create({
        userId: booking.userId,
        message: `Your booking with ${booking.expertId.name} on ${booking.date} at ${booking.timeSlot} has been confirmed.`,
        type: 'booking_confirmed'
      });
      req.io.emit(`notification:${booking.userId}`, { message: 'Booking confirmed!' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'cancelled' || booking.status === 'completed') return res.status(400).json({ message: 'Cannot cancel this booking' });

    const slotTime = new Date(`${booking.date}T${booking.timeSlot}`);
    const now = new Date();
    const diffHours = (slotTime - now) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return res.status(400).json({ message: 'Cannot cancel less than 2 hours before the session.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Expert.findOneAndUpdate(
      { _id: booking.expertId, 'availableSlots.date': booking.date, 'availableSlots.time': booking.timeSlot },
      { $set: { 'availableSlots.$.isBooked': false } }
    );

    req.io.emit('slotBooked', { expertId: booking.expertId, date: booking.date, timeSlot: booking.timeSlot, freed: true });

    const nextWait = await Waitlist.findOne({ expertId: booking.expertId, date: booking.date, timeSlot: booking.timeSlot }).sort({ createdAt: 1 }).populate('userId', 'name');
    if (nextWait) {
      const expert = await Expert.findById(booking.expertId);
      await Notification.create({
        userId: nextWait.userId._id || nextWait.userId,
        message: `A slot just opened for ${expert.name} on ${booking.date} at ${booking.timeSlot}!`,
        type: 'slot_opened',
        metadata: { expertId: booking.expertId, date: booking.date, timeSlot: booking.timeSlot }
      });
      req.io.emit(`notification:${nextWait.userId._id || nextWait.userId}`, { message: 'A slot just opened!' });
      await Waitlist.deleteOne({ _id: nextWait._id });
    }

    const populated = await Booking.findById(booking._id).populate('expertId', 'name');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body;
    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Only pending bookings can be rescheduled' });

    const expert = await Expert.findOneAndUpdate(
      {
        _id: booking.expertId,
        'availableSlots.date': date,
        'availableSlots.time': timeSlot,
        'availableSlots.isBooked': false
      },
      { $set: { 'availableSlots.$.isBooked': true } },
      { new: true }
    );
    if (!expert) {
      const err = new Error('Slot already booked');
      err.status = 409;
      return next(err);
    }

    const oldDate = booking.date;
    const oldTimeSlot = booking.timeSlot;

    booking.date = date;
    booking.timeSlot = timeSlot;
    await booking.save();

    await Expert.findOneAndUpdate(
      { _id: booking.expertId, 'availableSlots.date': oldDate, 'availableSlots.time': oldTimeSlot },
      { $set: { 'availableSlots.$.isBooked': false } }
    );

    req.io.emit('slotBooked', { expertId: booking.expertId, date: booking.date, timeSlot: booking.timeSlot, freed: true });
    req.io.emit('slotBooked', { expertId: booking.expertId, date, timeSlot });

    const populated = await Booking.findById(booking._id).populate('expertId', 'name');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};
