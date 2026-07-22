import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Shivam Enterprises REST API Server Running`);
    console.log(` Listening on Port : ${PORT}`);
    console.log(` Health Check      : http://localhost:${PORT}/api/health`);
    console.log(` Allowed Origin    : ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(` Environment       : ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
};

startServer();
