# Test script to verify login functionality after the fix

Write-Host "Testing Login Functionality..." -ForegroundColor Green

# Wait for server to start
Start-Sleep -Seconds 10

# Test 1: Register a new OWNER user
Write-Host "`n1. Testing Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Owner"
    email = "testowner@example.com"
    phone = "9876543210"
    password = "testpass123"
    role = "OWNER"
    address = "Test Address"
    district = "Test District"
    state = "Test State"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful: $($registerResponse.message)" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Role: $($registerResponse.role)" -ForegroundColor Cyan
    if ($registerResponse.farmerId) {
        Write-Host "   Farmer ID: $($registerResponse.farmerId)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Login with the registered user
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginData = @{
    phone = "9876543210"
    password = "testpass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful: $($loginResponse.message)" -ForegroundColor Green
    Write-Host "   User ID: $($loginResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Farmer ID: $($loginResponse.farmerId)" -ForegroundColor Cyan
    Write-Host "   Name: $($loginResponse.name)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Cyan
    Write-Host "   Is Admin: $($loginResponse.isAdmin)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green