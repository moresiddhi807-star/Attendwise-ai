-- ============================================================
--  AttendWise AI — MySQL Setup Script
--  Run this file once before starting the backend.
--  In MySQL Workbench: File → Open SQL Script → Run (Ctrl+Shift+Enter)
--  In terminal: mysql -u root -p < database/setup.sql
-- ============================================================

-- 1. Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS attendwise
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Switch to it
USE attendwise;

-- 3. Users table
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(191)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,          -- bcrypt hash
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Subjects table
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

-- 5. (Optional) Insert sample data for testing
--    Remove or comment out the block below if you don't want sample data.
-- INSERT INTO users (name, email, password) VALUES
--   ('Demo Student', 'demo@attendwise.com', '$2a$12$placeholder_hash');
-- NOTE: Register through the app instead — passwords are hashed automatically.

-- Done!
SELECT 'AttendWise database setup complete ✅' AS status;
