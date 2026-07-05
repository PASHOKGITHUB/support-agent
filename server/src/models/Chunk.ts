import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  text: string;
  embedding: number[];
  chunkIndex: number;
  companyId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ChunkSchema = new Schema<IChunk>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // Vector array
  chunkIndex: { type: Number, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  createdAt: { type: Date, default: Date.now }
});

export const Chunk = mongoose.model<IChunk>('Chunk', ChunkSchema);
