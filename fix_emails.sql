USE FarmTech;

UPDATE user SET email = CONCAT('user', id, '@farmtech.local') WHERE email IS NULL OR email = '';

UPDATE farmers SET email = CONCAT('farmer', id, '@farmtech.local') WHERE email IS NULL OR email = '';

SELECT 'Email update complete' as message;