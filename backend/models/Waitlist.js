import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Waitlist', waitlistSchema);
