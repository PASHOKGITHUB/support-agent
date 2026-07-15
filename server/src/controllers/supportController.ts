import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { SupportConfig } from '../models/SupportConfig.js';
import mongoose from 'mongoose';

export const getSupportConfig = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId ? new mongoose.Types.ObjectId(req.companyId) : undefined;
    
    // Find support config for company, or fall back to system default (where companyId is null/undefined)
    let config = await SupportConfig.findOne(companyId ? { companyId } : { companyId: { $exists: false } });
    
    if (!config) {
      // Create a default placeholder configuration
      config = new SupportConfig({
        companyName: 'System Default',
        supportEmail: 'support@example.com',
        supportPhone: '+1 (800) 555-0199',
        supportWebsite: 'https://example.com/support',
        contactFormLink: 'https://example.com/contact',
        workingHours: '9:00 AM - 5:00 PM (Mon-Fri)'
      });
    }

    let companyPlan = 'Free';
    let upgradedAt = null;
    let expiresAt = null;
    if (companyId) {
      const CompanyModel = mongoose.model('Company');
      const company = await CompanyModel.findById(companyId);
      if (company) {
        companyPlan = (company as any).plan || 'Free';
        upgradedAt = (company as any).upgradedAt || null;
        expiresAt = (company as any).expiresAt || null;
      }
    }

    return res.status(200).json({
      ...config.toObject(),
      companyPlan,
      upgradedAt,
      expiresAt
    });
  } catch (error) {
    console.error('Get support config error:', error);
    return res.status(500).json({ message: 'Server error fetching support configurations.' });
  }
};

export const updateSupportConfig = async (req: AuthRequest, res: Response) => {
  const { companyName, supportEmail, supportPhone, supportWebsite, contactFormLink, workingHours, logo } = req.body;

  try {
    if (!companyName || !supportEmail) {
      return res.status(400).json({ message: 'Company Name and Support Email are required.' });
    }

    const companyId = req.companyId ? new mongoose.Types.ObjectId(req.companyId) : undefined;
    
    const updateData = {
      companyName,
      supportEmail,
      supportPhone,
      supportWebsite,
      contactFormLink,
      workingHours,
      logo
    };

    // Find and update, or insert if it doesn't exist
    const config = await SupportConfig.findOneAndUpdate(
      companyId ? { companyId } : { companyId: { $exists: false } },
      { $set: updateData, companyId },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: 'Support configuration updated successfully.',
      config
    });
  } catch (error) {
    console.error('Update support config error:', error);
    return res.status(500).json({ message: 'Server error updating support configurations.' });
  }
};
