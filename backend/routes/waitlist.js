import { Router } from 'express';
import { joinWaitlist } from '../controllers/waitlistController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), joinWaitlist);

export default router;
