-- Baseline schema reconstruction for Flyway migration
-- This file should recreate the existing tables in your MySQL database.
-- Review and adjust data types/defaults if your current schema differs.

CREATE TABLE IF NOT EXISTS farmers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    aadhar_number VARCHAR(50),
    latitude DOUBLE,
    longitude DOUBLE,
    UNIQUE KEY uq_farmers_phone (phone),
    UNIQUE KEY uq_farmers_aadhar (aadhar_number)
);

CREATE TABLE IF NOT EXISTS equipments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    type VARCHAR(255),
    description TEXT,
    price_per_day DOUBLE,
    price_per_hour DOUBLE,
    price DOUBLE,
    image VARCHAR(255),
    owner_id BIGINT NOT NULL,
    CONSTRAINT fk_equipments_owner FOREIGN KEY (owner_id)
        REFERENCES farmers (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    equipment_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    renter_id BIGINT NOT NULL,
    start_date DATE,
    end_date DATE,
    hours INT,
    status VARCHAR(50),
    location VARCHAR(255),
    location_latitude DOUBLE,
    location_longitude DOUBLE,
    total_cost DOUBLE,
    CONSTRAINT fk_bookings_equipment FOREIGN KEY (equipment_id) REFERENCES equipments (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_owner FOREIGN KEY (owner_id) REFERENCES farmers (id),
    CONSTRAINT fk_bookings_renter FOREIGN KEY (renter_id) REFERENCES farmers (id)
);