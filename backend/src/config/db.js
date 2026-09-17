const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sports_equipment_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Returns DATE/TIME as 'YYYY-MM-DD' strings without UTC shifts
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'sports_equipment_db'));
    connection.release();
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
  }
})();

module.exports = pool;
