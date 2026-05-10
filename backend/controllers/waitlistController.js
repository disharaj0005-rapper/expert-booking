import Waitlist from '../models/Waitlist.js';
import Expert from '../models/Expert.js';

export const joinWaitlist = async (req, res, next) => {
  try {
    const { expertId, date, timeSlot } = req.body;
    const userId = req.user._id;

    const expert = await Expert.findById(expertId).lean();
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const slot = expert.availableSlots.find(s => s.date === date && s.time === timeSlot);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (!slot.isBooked) return res.status(400).json({ message: 'Slot is still available, book directly' });

    const existing = await Waitlist.findOne({ expertId, userId, date, timeSlot });
    if (existing) return res.status(409).json({ message: 'Already on waitlist for this slot' });

    const entry = await Waitlist.create({ expertId, userId, date, timeSlot });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};
