import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Company } from '../models/Company.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  companyId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production';
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: string;
      companyId?: string;
    };
    
    // Check if company is suspended
    if (decoded.companyId && decoded.role !== 'superadmin') {
      const company = await Company.findById(decoded.companyId);
      if (company && !company.isActive) {
        return res.status(403).json({ message: 'Your company account has been suspended. Please contact support.' });
      }
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.companyId = decoded.companyId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
  }
  next();
};
