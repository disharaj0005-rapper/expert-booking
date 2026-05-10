import { Router } from 'express';
import {
  getStats,
  getAllExperts,
  approveExpert,
  deleteExpert,
  getAllUsers,
  deleteUser,
  getAllBookings
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', verifyToken, requireRole('admin'), getStats);
router.get('/experts', verifyToken, requireRole('admin'), getAllExperts);
router.patch('/experts/:id/approve', verifyToken, requireRole('admin'), approveExpert);
router.delete('/experts/:id', verifyToken, requireRole('admin'), deleteExpert);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.delete('/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.get('/bookings', verifyToken, requireRole('admin'), getAllBookings);

export default router;
