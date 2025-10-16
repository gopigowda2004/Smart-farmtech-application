# Test RENTER role registration and login

Write-Host "Testing RENTER Role Functionality..." -ForegroundColor Green

# Test RENTER registration
Write-Host "`n1. Testing RENTER Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Renter"
    email = "testrenter@example.com"
    phone = "9876543211"
    password = "renterpass123"
    role = "RENTER"
    address = "Renter Address"
    district = "Renter District"
    state = "Renter State"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ RENTER Registration successful: $($registerResponse.message)" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Role: $($registerResponse.role)" -ForegroundColor Cyan
    if ($registerResponse.farmerId) {
        Write-Host "   Farmer ID: $($registerResponse.farmerId)" -ForegroundColor Cyan
    } else {
        Write-Host "   No Farmer ID (expected for RENTER)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ RENTER Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RENTER login
Write-Host "`n2. Testing RENTER Login..." -ForegroundColor Yellow
$loginData = @{
    phone = "9876543211"
    password = "renterpass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ RENTER Login successful: $($loginResponse.message)" -ForegroundColor Green
    Write-Host "   User ID: $($loginResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Farmer ID: $($loginResponse.farmerId)" -ForegroundColor Cyan
    Write-Host "   Name: $($loginResponse.name)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Cyan
    Write-Host "   Is Admin: $($loginResponse.isAdmin)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ RENTER Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRENTER Test completed!" -ForegroundColor Green