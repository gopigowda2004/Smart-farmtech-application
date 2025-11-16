USE FarmTech;

SELECT b.id, b.booker_id, u.email, u.phone, u.name, b.status 
FROM booking b 
LEFT JOIN user u ON b.booker_id = u.id 
ORDER BY b.created_at DESC LIMIT 5;