-- Create/Update Admin Account with provided credentials
-- Email: admin@farmtech.com
-- Phone: 8888899999
-- Password: 123@Gopi

INSERT INTO users (
  email, 
  phone, 
  password, 
  name, 
  full_name, 
  gender, 
  dob, 
  address, 
  district, 
  state, 
  pincode, 
  farm_size, 
  crop_type, 
  experience, 
  equipment_owned, 
  role
) VALUES (
  'admin@farmtech.com', 
  '8888899999', 
  '123@Gopi', 
  'Admin', 
  'System Administrator', 
  'Other', 
  '1990-01-01', 
  'FarmTech Headquarters', 
  'Bangalore', 
  'Karnataka', 
  '560001', 
  'N/A', 
  'N/A', 
  'System Management', 
  'All Equipment', 
  'ADMIN'
) ON DUPLICATE KEY UPDATE 
  phone = '8888899999',
  password = '123@Gopi',
  role = 'ADMIN';

-- Also create farmer record
INSERT INTO farmers (
  name, 
  email, 
  phone, 
  password, 
  address
) VALUES (
  'System Administrator', 
  'admin@farmtech.com', 
  '8888899999', 
  '123@Gopi', 
  'FarmTech HQ, Bangalore'
) ON DUPLICATE KEY UPDATE 
  phone = '8888899999',
  password = '123@Gopi';
