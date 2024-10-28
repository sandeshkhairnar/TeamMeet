// server.js
import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Ensure the extension is correct

config(); // Load environment variables
connectDB(); // Connect to the database

const app = express();
app.use(cors());
app.use(express.json()); // Use express.json() to parse JSON requests

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
