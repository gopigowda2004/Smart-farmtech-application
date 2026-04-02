$sql = @"
INSERT INTO users (email, phone, password, name, full_name, gender, dob, address, district, state, pincode, farm_size, crop_type, experience, equipment_owned, role) 
VALUES ('admin@farmtech.com', '8888899999', '123@Gopi', 'Admin', 'System Administrator', 'Other', '1990-01-01', 'FarmTech Headquarters', 'Bangalore', 'Karnataka', '560001', 'N/A', 'N/A', 'System Management', 'All Equipment', 'ADMIN') 
ON DUPLICATE KEY UPDATE phone='8888899999', password='123@Gopi', role='ADMIN';

INSERT INTO farmers (name, email, phone, password, address) 
VALUES ('System Administrator', 'admin@farmtech.com', '8888899999', '123@Gopi', 'FarmTech HQ, Bangalore') 
ON DUPLICATE KEY UPDATE phone='8888899999', password='123@Gopi';
"@

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Creating Admin Account" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sql | mysql -u root -proot FarmTech 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: admin@farmtech.com" -ForegroundColor White
    Write-Host "  Phone: 8888899999" -ForegroundColor White
    Write-Host "  Password: 123@Gopi" -ForegroundColor White
} else {
    Write-Host "⚠️ Exit code: $LASTEXITCODE" -ForegroundColor Yellow
}
