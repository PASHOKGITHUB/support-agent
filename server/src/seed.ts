import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

// Load environment variables
dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const email = 'superadmin@supportagent.ai';
    const defaultPassword = 'SuperAdmin123!';

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log(`[SEED] Super Admin already exists: ${existingSuperAdmin.email}`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create Super Admin user
    const superAdmin = await User.create({
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date()
    });

    console.log('\n=========================================');
    console.log('[SEED] Default Super Admin account created!');
    console.log(`Email:    ${superAdmin.email}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('=========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
