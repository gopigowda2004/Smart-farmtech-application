-- Clear all data for fresh start
DELETE FROM bookings;
DELETE FROM equipments;
DELETE FROM farmers;
DELETE FROM users;

-- Show tables are empty
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Farmers count:' as info, COUNT(*) as count FROM farmers
UNION ALL
SELECT 'Equipment count:' as info, COUNT(*) as count FROM equipments
UNION ALL 
SELECT 'Bookings count:' as info, COUNT(*) as count FROM bookings;