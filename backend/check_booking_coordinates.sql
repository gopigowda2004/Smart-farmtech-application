-- Check all bookings and their coordinates
SELECT 
    id,
    status,
    start_date,
    location_latitude,
    location_longitude,
    CASE 
        WHEN location_latitude IS NULL OR location_longitude IS NULL THEN '❌ NO COORDINATES'
        ELSE '✅ HAS COORDINATES'
    END as coordinate_status
FROM bookings
ORDER BY id DESC;