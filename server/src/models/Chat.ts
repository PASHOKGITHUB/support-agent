import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ICitation {
  documentId: mongoose.Types.ObjectId;
  filename: string;
  snippet: string;
}

export interface IMessage {
  sender: 'user' | 'assistant';
  text: string;
  citations?: ICitation[];
  createdAt: Date;
}

export interface IChat extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  companyId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
}

const CitationSchema = new Schema<ICitation>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  filename: { type: String, required: true },
  snippet: { type: String, required: true }
}, { _id: false });

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  citations: [CitationSchema],
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Conversation' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
