import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ISupportConfig extends MongooseDocument {
  companyId?: mongoose.Types.ObjectId;
  companyName: string;
  supportEmail: string;
  supportPhone?: string;
  supportWebsite?: string;
  contactFormLink?: string;
  workingHours?: string;
  createdAt: Date;
}

const SupportConfigSchema = new Schema<ISupportConfig>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', unique: true, index: true },
  companyName: { type: String, required: true },
  supportEmail: { type: String, required: true },
  supportPhone: { type: String },
  supportWebsite: { type: String },
  contactFormLink: { type: String },
  workingHours: { type: String, default: '9:00 AM - 5:00 PM (Mon-Fri)' },
  createdAt: { type: Date, default: Date.now }
});

export const SupportConfig = mongoose.model<ISupportConfig>('SupportConfig', SupportConfigSchema);
