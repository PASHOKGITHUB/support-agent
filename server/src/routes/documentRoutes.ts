import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/documentController.js';
import { requireAuth } from '../middlewares/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = Router();

// Apply auth middleware to all document routes
router.use(requireAuth as any);

router.post('/upload', upload.single('file'), uploadDocument as any);
router.get('/', getDocuments as any);
router.delete('/:id', deleteDocument as any);

export default router;
