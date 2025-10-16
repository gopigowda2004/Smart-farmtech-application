-- Remove Aadhar columns and clean up existing data for fresh start
-- This migration removes Aadhar requirements and clears existing users for fresh registration

-- First, drop foreign key constraints temporarily
ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_owner;
ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_renter;
ALTER TABLE equipments DROP FOREIGN KEY fk_equipments_owner;

-- Clear all existing data for fresh start
DELETE FROM bookings;
DELETE FROM equipments;
DELETE FROM farmers;

-- Drop users table if it exists (we'll recreate it without aadhar)
DROP TABLE IF EXISTS users;

-- Create users table without aadhar
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    full_name VARCHAR(255),
    gender VARCHAR(50),
    dob DATE,
    address VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(20),
    farm_size VARCHAR(100),
    crop_type VARCHAR(100),
    experience VARCHAR(255),
    equipment_owned VARCHAR(500),
    role VARCHAR(50) DEFAULT 'RENTER'
);

-- Remove aadhar_number column from farmers table
ALTER TABLE farmers DROP COLUMN aadhar_number;

-- Recreate foreign key constraints
ALTER TABLE equipments ADD CONSTRAINT fk_equipments_owner 
    FOREIGN KEY (owner_id) REFERENCES farmers (id) ON DELETE CASCADE;

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_equipment 
    FOREIGN KEY (equipment_id) REFERENCES equipments (id) ON DELETE CASCADE;

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_owner 
    FOREIGN KEY (owner_id) REFERENCES farmers (id);

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_renter 
    FOREIGN KEY (renter_id) REFERENCES farmers (id);