USE farmtech;

INSERT IGNORE INTO users (email, phone, password, name, full_name, role, address, district, state, pincode) 
VALUES ('admin@farmtech.com', '8888899999', '123@Gopi', 'Admin', 'System Administrator', 'ADMIN', 'FarmTech HQ, Bangalore', 'Bangalore', 'Karnataka', '560001');

INSERT IGNORE INTO farmers (name, email, phone, password, address) 
VALUES ('System Administrator', 'admin@farmtech.com', '8888899999', '123@Gopi', 'FarmTech HQ, Bangalore');

SELECT id, email, phone, role FROM users WHERE phone='8888899999';
SELECT id, email, phone FROM farmers WHERE phone='8888899999';
