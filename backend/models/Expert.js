import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
}, { _id: true });

const expertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  bio: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  availableSlots: [slotSchema]
}, { timestamps: true });

export default mongoose.model('Expert', expertSchema);
