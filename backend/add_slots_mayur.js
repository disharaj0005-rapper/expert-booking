import mongoose from 'mongoose';
import Expert from './models/Expert.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

async function addSlots() {
  try {
    await mongoose.connect(MONGODB_URI);
    const expertId = '69feb0ae2f7243f32fbbb544';
    const expert = await Expert.findById(expertId);

    if (!expert) {
      console.log('Expert not found');
      process.exit(1);
    }

    const today = new Date();
    const slots = [];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      times.forEach(time => {
        slots.push({
          date: dateString,
          time: time,
          isBooked: false
        });
      });
    }

    expert.availableSlots.push(...slots);
    await expert.save();
    console.log(`Added ${slots.length} slots for Mayur.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addSlots();
