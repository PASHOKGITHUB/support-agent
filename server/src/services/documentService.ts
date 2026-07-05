import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import mongoose from 'mongoose';
import { Document } from '../models/Document.js';
import { Chunk } from '../models/Chunk.js';
import { getEmbedding } from './aiService.js';

/**
 * Extract raw text from different file types based on mime-type.
 */
export const extractTextFromFile = async (buffer: Buffer, mimeType: string): Promise<string> => {
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  } else if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword'
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

/**
 * Splits text into overlapping chunks along word boundaries.
 */
export const chunkText = (text: string, chunkSize = 800, chunkOverlap = 150): string[] => {
  const chunks: string[] = [];
  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  let currentIndex = 0;

  while (currentIndex < cleanText.length) {
    let endIndex = currentIndex + chunkSize;
    
    if (endIndex < cleanText.length) {
      // Find space/punctuation boundary to avoid cutting words
      const sub = cleanText.substring(currentIndex, endIndex);
      const lastSpace = sub.lastIndexOf(' ');
      const lastPeriod = sub.lastIndexOf('.');
      const lastNewline = sub.lastIndexOf('\n');
      
      const bestSplit = Math.max(lastNewline, lastPeriod, lastSpace);
      // If we found a reasonable split point, use it
      if (bestSplit > chunkSize * 0.6) {
        endIndex = currentIndex + bestSplit + 1;
      }
    }

    const chunk = cleanText.substring(currentIndex, endIndex).trim();
    if (chunk.length > 10) {
      chunks.push(chunk);
    }
    
    currentIndex = endIndex - chunkOverlap;
    
    // Safety check to avoid infinite loop
    if (chunkOverlap >= chunkSize || endIndex <= currentIndex) {
      currentIndex = endIndex;
    }
  }

  return chunks;
};

/**
 * Processes an uploaded document: extracts text, chunks it, generates embeddings,
 * and saves both document metadata and vector chunks in the database.
 */
export const processAndStoreDocument = async (
  file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  userId: string,
  companyId?: string
): Promise<any> => {
  // 1. Extract text
  const rawText = await extractTextFromFile(file.buffer, file.mimetype);
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('No text content could be extracted from this document.');
  }

  // 2. Create document metadata record in DB
  const docDb = await Document.create({
    filename: `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: new mongoose.Types.ObjectId(userId),
    companyId: companyId ? new mongoose.Types.ObjectId(companyId) : undefined
  });

  // 3. Chunk text
  const textChunks = chunkText(rawText);

  // 4. Generate embeddings and save chunks
  const chunkPromises = textChunks.map(async (text, index) => {
    try {
      const embedding = await getEmbedding(text);
      return await Chunk.create({
        documentId: docDb._id,
        text,
        embedding,
        chunkIndex: index,
        companyId: companyId ? new mongoose.Types.ObjectId(companyId) : undefined
      });
    } catch (error) {
      console.error(`Failed to process chunk ${index} for document ${docDb._id}:`, error);
      // We can fail the whole document or log it. Let's throw to ensure data integrity
      throw error;
    }
  });

  await Promise.all(chunkPromises);
  
  return docDb;
};
