// db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app_db',
  password: process.env.DB_PASS || 'adsapp',
  database: process.env.DB_NAME || 'adsapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
