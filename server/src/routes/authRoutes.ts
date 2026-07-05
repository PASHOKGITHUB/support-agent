import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth as any, getProfile as any);

export default router;
