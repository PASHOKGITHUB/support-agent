import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Document } from '../models/Document.js';
import { Chunk } from '../models/Chunk.js';
import { processAndStoreDocument } from '../services/documentService.js';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID missing.' });
    }

    const doc = await processAndStoreDocument(
      {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      req.userId,
      req.companyId
    );

    return res.status(201).json({
      message: 'Document uploaded and processed successfully.',
      document: doc
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return res.status(500).json({
      message: `Failed to upload and process document: ${(error as Error).message}`
    });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.companyId) {
      filter.companyId = req.companyId;
    }

    const docs = await Document.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(docs);
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ message: 'Server error fetching documents.' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Verify company isolation if configured
    if (req.companyId && doc.companyId?.toString() !== req.companyId) {
      return res.status(403).json({ message: 'Unauthorized access to this document.' });
    }

    // Cascade delete: delete all text chunks and embeddings associated with this document
    await Chunk.deleteMany({ documentId: doc._id });
    
    // Delete document metadata
    await Document.findByIdAndDelete(doc._id);

    return res.status(200).json({ message: 'Document and its vector embeddings deleted successfully.' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ message: 'Server error deleting document.' });
  }
};
