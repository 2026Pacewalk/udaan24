-- Run as MySQL root to create the local Udaan24 database + app user.
-- Usage (PowerShell):
--   & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p < "F:\Udaan24 Website\app\db\setup-local-db.sql"

CREATE DATABASE IF NOT EXISTS udaan24 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'udaan24'@'localhost'  IDENTIFIED BY 'Udaan24_Local9';
CREATE USER IF NOT EXISTS 'udaan24'@'127.0.0.1' IDENTIFIED BY 'Udaan24_Local9';

GRANT ALL PRIVILEGES ON udaan24.* TO 'udaan24'@'localhost';
GRANT ALL PRIVILEGES ON udaan24.* TO 'udaan24'@'127.0.0.1';
FLUSH PRIVILEGES;

SELECT 'udaan24 DB + user created OK' AS result;
