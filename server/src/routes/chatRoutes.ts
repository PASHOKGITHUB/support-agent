import { Router } from 'express';
import { 
  createChatSession, 
  getChatSessions, 
  getChatSession, 
  deleteChatSession, 
  sendMessage 
} from '../controllers/chatController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Apply auth to all chat endpoints
router.use(requireAuth as any);

router.post('/', createChatSession as any);
router.get('/', getChatSessions as any);
router.get('/:id', getChatSession as any);
router.delete('/:id', deleteChatSession as any);
router.post('/:id/messages', sendMessage as any);

export default router;
