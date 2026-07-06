import { Router } from 'express';
import {
  getAllCompanies,
  toggleCompanyStatus,
  updateCompanyPlan,
  getGlobalMetrics
} from '../controllers/superAdminController.js';
import { requireAuth, requireSuperAdmin } from '../middlewares/auth.js';

const router = Router();

// Apply auth & superadmin protection to all routes
router.use(requireAuth as any);
router.use(requireSuperAdmin as any);

router.get('/companies', getAllCompanies as any);
router.post('/companies/:id/toggle', toggleCompanyStatus as any);
router.post('/companies/:id/plan', updateCompanyPlan as any);
router.get('/metrics', getGlobalMetrics as any);

export default router;
