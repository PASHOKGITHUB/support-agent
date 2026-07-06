import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { Document } from '../models/Document.js';
import mongoose from 'mongoose';

export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const usersCount = await User.countDocuments({ companyId: company._id });
        const docsCount = await Document.countDocuments({ companyId: company._id });
        const chats = await Chat.find({ companyId: company._id });
        
        let apiRequestsCount = 0;
        chats.forEach((chat) => {
          apiRequestsCount += chat.messages.filter((m) => m.sender === 'assistant').length;
        });

        return {
          _id: company._id,
          name: company.name,
          isActive: company.isActive,
          plan: company.plan,
          createdAt: company.createdAt,
          usersCount,
          docsCount,
          chatsCount: chats.length,
          apiRequestsCount
        };
      })
    );

    return res.status(200).json(enrichedCompanies);
  } catch (error) {
    console.error('Super Admin: Get all companies error:', error);
    return res.status(500).json({ message: 'Server error fetching companies.' });
  }
};

export const toggleCompanyStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    company.isActive = !company.isActive;
    await company.save();

    return res.status(200).json({
      message: `Company ${company.isActive ? 'activated' : 'suspended'} successfully.`,
      company
    });
  } catch (error) {
    console.error('Super Admin: Toggle company status error:', error);
    return res.status(500).json({ message: 'Server error updating company status.' });
  }
};

export const updateCompanyPlan = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { plan } = req.body;

  try {
    if (!plan || !['Free', 'Starter', 'Growth', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan. Must be "Free", "Starter", "Growth", or "Enterprise".' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    company.plan = plan;
    if (plan === 'Free') {
      company.upgradedAt = undefined;
      company.expiresAt = undefined;
    } else {
      company.upgradedAt = new Date();
      // Set plan expiration to 30 days in the future
      company.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    await company.save();

    return res.status(200).json({
      message: `Plan updated to ${plan} successfully.`,
      company
    });
  } catch (error) {
    console.error('Super Admin: Update plan error:', error);
    return res.status(500).json({ message: 'Server error updating plan.' });
  }
};

export const getGlobalMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDocs = await Document.countDocuments();
    
    const chats = await Chat.find();
    const totalChats = chats.length;

    let totalApiRequests = 0;
    chats.forEach((chat) => {
      totalApiRequests += chat.messages.filter((m) => m.sender === 'assistant').length;
    });

    // Breakdown per company
    const companies = await Company.find();
    const apiRequestsBreakdown = await Promise.all(
      companies.map(async (company) => {
        const compChats = await Chat.find({ companyId: company._id });
        let count = 0;
        compChats.forEach((chat) => {
          count += chat.messages.filter((m) => m.sender === 'assistant').length;
        });
        return {
          companyName: company.name,
          count
        };
      })
    );

    // Document processed distribution
    const docProcessedBreakdown = await Promise.all(
      companies.map(async (company) => {
        const count = await Document.countDocuments({ companyId: company._id });
        return {
          companyName: company.name,
          count
        };
      })
    );

    return res.status(200).json({
      totalCompanies,
      totalUsers,
      totalChats,
      totalDocs,
      totalApiRequests,
      apiRequestsBreakdown,
      docProcessedBreakdown
    });
  } catch (error) {
    console.error('Super Admin: Get global metrics error:', error);
    return res.status(500).json({ message: 'Server error fetching global metrics.' });
  }
};
