import { Router } from 'express';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  deleteTeamMember
} from '../controllers/teamController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', getTeamMembers as any);
router.post('/', addTeamMember as any);
router.put('/:id/role', updateTeamMemberRole as any);
router.delete('/:id', deleteTeamMember as any);

export default router;
