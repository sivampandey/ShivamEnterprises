import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      // ignore DNS set error if restricted
    }

    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shivam_enterprises';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Warning] Please ensure MongoDB service is running locally or specify MONGODB_URI in server/.env`);
    return false;
  }
};
