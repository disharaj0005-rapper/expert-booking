# Expert Session Booking System

A real-time full-stack web application for booking expert sessions.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, Socket.io-client, React Router DOM
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Socket.io

## Project Structure

```
expert-booking/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── .env
│   ├── server.js
│   └── seed.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.jsx
    └── vite.config.js
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account ([Create free cluster](https://www.mongodb.com/atlas))

### Backend Setup

```bash
cd backend
npm install
```

Update `backend/.env` with your MongoDB Atlas credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/expert-booking?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here
```

> **Note:** Make sure to whitelist your IP address in MongoDB Atlas → Network Access.

Seed the database with 8 sample experts:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Features

- **Expert Listing** with search, category filter, and pagination
- **Expert Detail** with real-time slot availability via Socket.io
- **Booking Page** with client-side validation and atomic double-booking prevention
- **My Bookings** lookup by email with status badges
- **Race-condition safe booking** using MongoDB atomic `findOneAndUpdate`
