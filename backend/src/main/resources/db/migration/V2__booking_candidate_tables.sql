-- Migration to add booking candidate support and geolocation fields

-- Ensure farmer coordinates exist
ALTER TABLE farmers
    ADD COLUMN IF NOT EXISTS latitude DOUBLE,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE;

-- Ensure bookings capture request location coordinates
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS location_latitude DOUBLE,
    ADD COLUMN IF NOT EXISTS location_longitude DOUBLE;

-- Track which owner has accepted the booking (for future analytics)
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS accepted_owner_id BIGINT,
    ADD CONSTRAINT fk_bookings_accepted_owner
        FOREIGN KEY (accepted_owner_id) REFERENCES farmers (id);

-- Booking candidates table to manage sequential owner notifications
CREATE TABLE IF NOT EXISTS booking_candidates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    distance_km DOUBLE,
    status VARCHAR(50) NOT NULL,
    invited_at DATETIME,
    responded_at DATETIME,
    CONSTRAINT fk_booking_candidates_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_candidates_owner FOREIGN KEY (owner_id)
        REFERENCES farmers (id),
    UNIQUE KEY uq_candidate_per_owner (booking_id, owner_id)
);