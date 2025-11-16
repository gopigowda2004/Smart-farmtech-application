-- Add email addresses to existing users who don't have them
UPDATE `users` SET `email` = CONCAT('user', `id`, '@farmtech.local') WHERE `email` IS NULL OR `email` = '';

-- Add email addresses to existing farmers who don't have them  
UPDATE `farmers` SET `email` = CONCAT('farmer', `id`, '@farmtech.local') WHERE `email` IS NULL OR `email` = '';

-- Verify the updates
SELECT id, name, email, phone FROM users LIMIT 5;
SELECT id, name, email, phone FROM farmers LIMIT 5;
