import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`PА server running on http://localhost:${PORT}`);
  });
};

start();
