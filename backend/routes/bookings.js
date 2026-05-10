import { Router } from 'express';
import {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking
} from '../controllers/bookingController.js';
import {
  validateBooking,
  validateStatusUpdate,
  validateGetBookings
} from '../middleware/validators.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, validateBooking, createBooking);
router.get('/', validateGetBookings, getBookingsByEmail);
router.patch('/:id/status', verifyToken, requireRole('expert', 'admin'), validateStatusUpdate, updateBookingStatus);
router.patch('/:id/cancel', verifyToken, requireRole('user'), cancelBooking);
router.patch('/:id/reschedule', verifyToken, requireRole('user'), rescheduleBooking);

export default router;
