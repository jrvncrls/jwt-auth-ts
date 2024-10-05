import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

// Configure CORS options
const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:4200'], // Allow specific frontend origin
  methods: ['GET', 'POST', 'PUT'], // Allow only specified HTTP methods
  allowedHeaders: [
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Api-Version',
  ], // Allow specified headers
  credentials: true, // Allow cookies or authentication headers
  preflightContinue: false, // Terminate preflight responses
  optionsSuccessStatus: 204, // Status for successful OPTIONS preflight requests
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use('/auth', authRoutes);
