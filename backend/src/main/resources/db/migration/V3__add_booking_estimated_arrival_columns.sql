ALTER TABLE bookings
    ADD COLUMN estimated_arrival_time VARCHAR(255) NULL,
    ADD COLUMN estimated_arrival_date_time DATETIME NULL;