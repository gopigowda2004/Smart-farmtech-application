-- Create admin user for equipment management
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
    'admin@farmtech.com',  -- Admin email
    '9999999999',  -- Admin phone
    'admin123',  -- Admin password (should be hashed in production)
    'Admin',  -- Short name
    'System Administrator',  -- Full name
    'Other',  -- Gender
    '1990-01-01',  -- Date of birth
    'FarmTech Headquarters',  -- Address
    'Bangalore',  -- District
    'Karnataka',  -- State
    '560001',  -- Pincode
    'N/A',  -- Farm size
    'N/A',  -- Crop type
    'System Management',  -- Experience
    'All Equipment',  -- Equipment owned
    'ADMIN'  -- Role
) ON DUPLICATE KEY UPDATE role = 'ADMIN';

-- Also create a corresponding farmer record for the admin (for equipment ownership)
INSERT INTO farmers (
    name, 
    email, 
    phone, 
    password, 
    village, 
    district, 
    state, 
    pincode, 
    farm_size, 
    crop_type, 
    experience, 
    equipment_owned
) VALUES (
    'System Administrator',
    'admin@farmtech.com',
    '9999999999',
    'admin123',
    'FarmTech HQ',
    'Bangalore',
    'Karnataka',
    '560001',
    'N/A',
    'N/A',
    'System Management',
    'All Equipment'
) ON DUPLICATE KEY UPDATE name = 'System Administrator';