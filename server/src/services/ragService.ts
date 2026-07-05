import mongoose from 'mongoose';
import { Chunk } from '../models/Chunk.js';
import { getEmbedding } from './aiService.js';
import { IDocument } from '../models/Document.js';

interface ISimilarityResult {
  text: string;
  documentId: mongoose.Types.ObjectId;
  filename: string;
  score: number;
}

/**
 * Programmatic cosine similarity function for local MongoDB fallback.
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  if (vecA.length !== vecB.length) return 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0.0 || normB === 0.0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Queries similar document chunks based on a vector embedding.
 * Tries Atlas Vector Search first, and falls back to programmatic similarity comparison if that fails.
 */
export const retrieveContext = async (
  queryText: string,
  limit = 4,
  companyId?: string
): Promise<ISimilarityResult[]> => {
  const queryEmbedding = await getEmbedding(queryText);
  const filter: any = {};
  if (companyId) {
    filter.companyId = new mongoose.Types.ObjectId(companyId);
  }

  // Attempt 1: MongoDB Atlas Vector Search
  try {
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index', // Name of the Atlas vector index
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit,
          filter: companyId ? { companyId: new mongoose.Types.ObjectId(companyId) } : undefined
        }
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentInfo'
        }
      },
      {
        $unwind: '$documentInfo'
      },
      {
        $project: {
          text: 1,
          documentId: 1,
          filename: '$documentInfo.originalName',
          score: { $meta: 'searchScore' }
        }
      }
    ]);

    if (results && results.length > 0) {
      return results.map(r => ({
        text: r.text,
        documentId: r.documentId,
        filename: r.filename,
        score: r.score
      }));
    }
  } catch (error) {
    console.warn(
      'Atlas Vector Search unavailable or failed. Falling back to in-memory cosine similarity search:',
      (error as Error).message
    );
  }

  // Attempt 2: Programmatic Fallback (Local Mongoose Find + Cosine Similarity)
  try {
    const chunks = await Chunk.find(filter).populate<{ documentId: IDocument }>('documentId');
    if (!chunks || chunks.length === 0) {
      return [];
    }

    const scoredChunks = chunks
      .map(c => {
        const score = cosineSimilarity(queryEmbedding, c.embedding);
        return {
          text: c.text,
          documentId: c.documentId._id as mongoose.Types.ObjectId,
          filename: c.documentId ? c.documentId.originalName : 'Unknown Document',
          score
        };
      })
      // Sort by highest similarity
      .sort((a, b) => b.score - a.score)
      // Limit results
      .slice(0, limit);

    return scoredChunks;
  } catch (error) {
    console.error('Local similarity search fallback failed:', error);
    throw new Error(`Context retrieval failed: ${(error as Error).message}`);
  }
};
