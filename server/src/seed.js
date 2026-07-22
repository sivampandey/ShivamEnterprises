import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Admin } from './models/Admin.js';
import { Labourer } from './models/Labourer.js';
import { AttendanceRecord } from './models/AttendanceRecord.js';

dotenv.config();

const seedDatabase = async () => {
  console.log('[Seed] Initializing database seeding...');
  const connected = await connectDB();
  if (!connected) {
    console.error('[Seed Error] Could not connect to MongoDB database.');
    process.exit(1);
  }

  try {
    // 1. Seed Admin User
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await Admin.create({ username: 'admin', passwordHash });
      console.log('[Seed Success] Created default admin user (admin / admin123)');
    } else {
      console.log('[Seed Info] Admin user already exists.');
    }

    // 2. Seed Sample Labourers if empty
    const count = await Labourer.countDocuments();
    if (count === 0) {
      const sampleWorkers = [
        { name: 'Ramesh Kumar', dailyWage: 650, active: true },
        { name: 'Suresh Verma', dailyWage: 700, active: true },
        { name: 'Amit Sharma', dailyWage: 600, active: true },
        { name: 'Vikram Singh', dailyWage: 800, active: true },
        { name: 'Pankaj Yadav', dailyWage: 550, active: true },
      ];

      const created = await Labourer.insertMany(sampleWorkers);
      console.log(`[Seed Success] Created ${created.length} sample labourers.`);

      // Seed sample attendance for today
      const today = new Date().toISOString().split('T')[0];
      await AttendanceRecord.create([
        { labourerId: created[0]._id, date: today, status: 'present', withdrawal: 100 },
        { labourerId: created[1]._id, date: today, status: 'half', withdrawal: 0 },
        { labourerId: created[2]._id, date: today, status: 'absent', withdrawal: 0 },
        { labourerId: created[3]._id, date: today, status: 'present', withdrawal: 200 },
      ]);
      console.log(`[Seed Success] Created sample attendance records for today (${today}).`);
    }

    console.log('[Seed Finished] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
