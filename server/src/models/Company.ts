import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ICompany extends MongooseDocument {
  name: string;
  isActive: boolean;
  plan: 'Free' | 'Starter' | 'Growth' | 'Enterprise';
  upgradedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  plan: { type: String, enum: ['Free', 'Starter', 'Growth', 'Enterprise'], default: 'Free' },
  upgradedAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
