import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.companyId) {
      return res.status(400).json({ message: 'Company workspace ID is missing.' });
    }

    const members = await User.find({ companyId: new mongoose.Types.ObjectId(req.companyId) })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    return res.status(500).json({ message: 'Server error fetching team members.' });
  }
};

export const addTeamMember = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    if (!req.companyId) {
      return res.status(400).json({ message: 'Company workspace ID is missing.' });
    }

    // Check permissions (Only admins can add team members)
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Only company Admins can manage team members.' });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all details (name, email, password, role).' });
    }

    if (!['admin', 'agent', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin", "agent", or "viewer".' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newMember = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId: new mongoose.Types.ObjectId(req.companyId)
    });

    return res.status(201).json({
      message: 'Team member added successfully.',
      member: {
        id: newMember._id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role
      }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    return res.status(500).json({ message: 'Server error adding team member.' });
  }
};

export const updateTeamMemberRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!req.companyId) {
      return res.status(400).json({ message: 'Company workspace ID is missing.' });
    }

    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Only company Admins can manage team members.' });
    }

    if (!role || !['admin', 'agent', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin", "agent", or "viewer".' });
    }

    const member = await User.findOne({ _id: id, companyId: new mongoose.Types.ObjectId(req.companyId) });
    if (!member) {
      return res.status(404).json({ message: 'Team member not found in your company.' });
    }

    // Prevent changing own role
    if (member._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    member.role = role;
    await member.save();

    return res.status(200).json({
      message: 'Role updated successfully.',
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role
      }
    });
  } catch (error) {
    console.error('Update team member error:', error);
    return res.status(500).json({ message: 'Server error updating team member.' });
  }
};

export const deleteTeamMember = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!req.companyId) {
      return res.status(400).json({ message: 'Company workspace ID is missing.' });
    }

    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Only company Admins can manage team members.' });
    }

    const member = await User.findOne({ _id: id, companyId: new mongoose.Types.ObjectId(req.companyId) });
    if (!member) {
      return res.status(404).json({ message: 'Team member not found in your company.' });
    }

    // Prevent deleting self
    if (member._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Team member removed successfully.' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return res.status(500).json({ message: 'Server error removing team member.' });
  }
};
