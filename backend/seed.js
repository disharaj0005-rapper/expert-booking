import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Expert from './models/Expert.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

const categories = ['Tech', 'Finance', 'Health', 'Legal', 'Marketing'];

const expertNames = [
  'Dr. Ananya Sharma',
  'Rohan Mehta',
  'Priya Iyer',
  'Karthik Nair',
  'Sneha Patel',
  'Arjun Reddy',
  'Divya Gupta',
  'Vikram Joshi'
];

const bios = [
  'Senior software architect with 12 years in full-stack development and cloud infrastructure.',
  'Certified financial planner specializing in wealth management and retirement strategies.',
  'Experienced nutritionist and wellness coach helping clients achieve sustainable health goals.',
  'Corporate lawyer with deep expertise in mergers, acquisitions, and IP law.',
  'Growth marketer who has scaled three startups from zero to Series B.',
  'AI/ML researcher and consultant building production-grade recommendation systems.',
  'Clinical psychologist focusing on cognitive behavioral therapy and stress management.',
  'Digital marketing strategist with a track record of 10x ROI on paid campaigns.'
];

function generateSlots() {
  const slots = [];
  const today = new Date();
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    for (const time of times) {
      slots.push({ date: dateStr, time, isBooked: false });
    }
  }
  return slots;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Expert.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    console.log('Cleared existing collections');

    const hashed = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashed,
      role: 'admin',
      isApproved: true
    });
    console.log('Created admin');

    const user1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: hashed,
      role: 'user',
      isApproved: true
    });
    const user2 = await User.create({
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: hashed,
      role: 'user',
      isApproved: true
    });
    console.log('Created 2 regular users');

    const expertUsers = [];
    const experts = [];
    for (let i = 0; i < 4; i++) {
      const u = await User.create({
        name: expertNames[i],
        email: `expert${i + 1}@example.com`,
        password: hashed,
        role: 'expert',
        isApproved: true
      });
      expertUsers.push(u);
      const slots = generateSlots();
      const e = await Expert.create({
        userId: u._id,
        name: expertNames[i],
        category: categories[i],
        experience: 5 + i * 2,
        rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        bio: bios[i],
        hourlyRate: 50 + i * 25,
        availableSlots: slots
      });
      experts.push(e);
    }
    console.log('Created 4 approved experts');

    const today = new Date().toISOString().split('T')[0];
    const booking1 = await Booking.create({
      expertId: experts[0]._id,
      userId: user1._id,
      name: user1.name,
      email: user1.email,
      phone: '9876543210',
      date: today,
      timeSlot: '09:00',
      notes: 'Need career advice',
      status: 'completed'
    });
    const booking2 = await Booking.create({
      expertId: experts[1]._id,
      userId: user1._id,
      name: user1.name,
      email: user1.email,
      phone: '9876543210',
      date: today,
      timeSlot: '10:00',
      notes: 'Investment planning session',
      status: 'confirmed'
    });
    const booking3 = await Booking.create({
      expertId: experts[2]._id,
      userId: user2._id,
      name: user2.name,
      email: user2.email,
      phone: '9123456780',
      date: today,
      timeSlot: '11:00',
      notes: 'Wellness consultation',
      status: 'pending'
    });

    await Expert.findOneAndUpdate(
      { _id: experts[0]._id, 'availableSlots.date': today, 'availableSlots.time': '09:00' },
      { $set: { 'availableSlots.$.isBooked': true } }
    );
    await Expert.findOneAndUpdate(
      { _id: experts[1]._id, 'availableSlots.date': today, 'availableSlots.time': '10:00' },
      { $set: { 'availableSlots.$.isBooked': true } }
    );
    await Expert.findOneAndUpdate(
      { _id: experts[2]._id, 'availableSlots.date': today, 'availableSlots.time': '11:00' },
      { $set: { 'availableSlots.$.isBooked': true } }
    );
    console.log('Created 3 bookings');

    await Review.create({
      expertId: experts[0]._id,
      bookingId: booking1._id,
      userId: user1._id,
      rating: 5,
      comment: 'Excellent session, very insightful!'
    });
    console.log('Created 1 review');

    await mongoose.disconnect();
    console.log('Seeding complete. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
