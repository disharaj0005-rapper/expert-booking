import { Router } from 'express';
import { getExperts, getExpertById, updateExpert, addSlot, deleteSlot, getExpertDashboard } from '../controllers/expertController.js';
import { verifyToken, requireRole, requireApproved } from '../middleware/auth.js';
import { validateExpertId } from '../middleware/validators.js';

const router = Router();

router.get('/', getExperts);
router.get('/dashboard', verifyToken, requireRole('expert'), requireApproved, getExpertDashboard);
router.get('/:id', validateExpertId, getExpertById);
router.patch('/:id', verifyToken, requireRole('expert'), requireApproved, updateExpert);
router.post('/slots', verifyToken, requireRole('expert'), requireApproved, addSlot);
router.delete('/slots/:slotId', verifyToken, requireRole('expert'), requireApproved, deleteSlot);

export default router;
