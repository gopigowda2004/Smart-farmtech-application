-- Add test coordinates to the most recent booking for testing
-- Using Tumkur coordinates as example: 13.3392, 77.1006

UPDATE bookings 
SET 
    location_latitude = 13.3392,
    location_longitude = 77.1006
WHERE id = (SELECT id FROM (SELECT id FROM bookings ORDER BY id DESC LIMIT 1) as temp);

-- Verify the update
SELECT 
    id,
    status,
    location_latitude,
    location_longitude,
    CASE 
        WHEN location_latitude IS NULL OR location_longitude IS NULL THEN '❌ NO COORDINATES'
        ELSE '✅ HAS COORDINATES'
    END as coordinate_status
FROM bookings
ORDER BY id DESC
LIMIT 5;