import { Router } from 'express';
import { createReview, getReviewsByExpert } from '../controllers/reviewController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), createReview);
router.get('/:expertId', getReviewsByExpert);

export default router;
