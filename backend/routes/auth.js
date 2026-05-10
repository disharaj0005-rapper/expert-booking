import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', verifyToken, me);

export default router;
