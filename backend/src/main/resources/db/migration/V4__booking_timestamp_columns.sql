-- Add timestamp columns to support booking analytics
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS confirmed_at DATETIME(6) NULL;

-- Ensure legacy rows have a created_at value
UPDATE bookings
SET created_at = COALESCE(created_at, NOW(6));