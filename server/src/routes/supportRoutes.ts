import { Router } from 'express';
import { getSupportConfig, updateSupportConfig } from '../controllers/supportController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', getSupportConfig as any);
router.post('/', updateSupportConfig as any);

export default router;
