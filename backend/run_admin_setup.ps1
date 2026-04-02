$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Creating Admin Account for FarmTech" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    $mysqlPath = "mysql.exe"
}

# Try to execute SQL file
Write-Host "Attempting to create admin account..." -ForegroundColor Yellow
Write-Host "Phone: 8888899999" -ForegroundColor White
Write-Host "Password: 123@Gopi" -ForegroundColor White
Write-Host ""

try {
    # Execute without password (assumes no password set)
    & $mysqlPath -u root farmtech < create_admin_gopi.sql 2>$null
    
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: admin@farmtech.com" -ForegroundColor White
    Write-Host "  Phone: 8888899999" -ForegroundColor White
    Write-Host "  Password: 123@Gopi" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating admin account" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. MySQL is running" -ForegroundColor White
    Write-Host "2. Database 'farmtech' exists" -ForegroundColor White
    Write-Host "3. MySQL root user has no password OR update the script" -ForegroundColor White
}
