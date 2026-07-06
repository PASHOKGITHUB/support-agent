import { Router } from 'express';
import {
  getPublicSupportConfig,
  createPublicChatSession,
  getPublicChatSession,
  sendPublicMessage,
  submitPublicFeedback
} from '../controllers/publicController.js';

const router = Router();

router.get('/support', getPublicSupportConfig);
router.post('/chats', createPublicChatSession);
router.get('/chats/:id', getPublicChatSession);
router.post('/chats/:id/messages', sendPublicMessage);
router.post('/chats/:id/feedback', submitPublicFeedback);

export default router;
