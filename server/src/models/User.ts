import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'agent' | 'viewer';
  companyId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'agent', 'viewer'], default: 'admin' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
