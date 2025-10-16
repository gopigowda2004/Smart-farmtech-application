-- Test script to register different user types
-- Run this after the backend starts successfully

-- First, let's check if the migration worked
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check farmers table structure  
DESCRIBE farmers;

-- Clear any existing data for fresh start
DELETE FROM bookings;
DELETE FROM equipments;
DELETE FROM farmers;
DELETE FROM users;

-- Test data will be inserted via API calls, not SQL
-- This file is just for verification