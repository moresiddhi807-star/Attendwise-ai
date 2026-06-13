const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'attendwise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

// Test connection on startup
async function connectDB() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
}

// Run all CREATE TABLE statements so tables exist on first run
async function initDB() {
  const conn = await pool.getConnection();
  try {
    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        email       VARCHAR(191)  NOT NULL UNIQUE,
        password    VARCHAR(255)  NOT NULL,
        created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Subjects table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id                    INT AUTO_INCREMENT PRIMARY KEY,
        user_id               INT           NOT NULL,
        subject_name          VARCHAR(150)  NOT NULL,
        attended_classes      INT           NOT NULL DEFAULT 0,
        total_classes         INT           NOT NULL DEFAULT 1,
        attendance_percentage DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
        created_at            DATETIME      DEFAULT CURRENT_TIMESTAMP,
        updated_at            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ Failed to initialise tables:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, connectDB, initDB };
