Write-Host "Registering Admin Account via API..." -ForegroundColor Green

$registerData = @{
    name = "Admin"
    email = "admin@farmtech.com"
    phone = "8888899999"
    password = "123@Gopi"
    fullName = "System Administrator"
    role = "ADMIN"
    address = "FarmTech HQ, Bangalore"
    district = "Bangalore"
    state = "Karnataka"
    pincode = "560001"
} | ConvertTo-Json

Write-Host "Attempting to register admin account with phone 8888899999..." -ForegroundColor Yellow

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Admin registration successful!" -ForegroundColor Green
    Write-Host "   Message: $($registerResponse.message)" -ForegroundColor Cyan
    Write-Host "   User ID: $($registerResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Farmer ID: $($registerResponse.farmerId)" -ForegroundColor Cyan
    Write-Host "   Role: $($registerResponse.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Error details: $body" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`nNow testing admin login..." -ForegroundColor Yellow

$loginData = @{
    phone = "8888899999"
    password = "123@Gopi"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "   Message: $($loginResponse.message)" -ForegroundColor Cyan
    Write-Host "   User ID: $($loginResponse.userId)" -ForegroundColor Cyan
    Write-Host "   Farmer ID: $($loginResponse.farmerId)" -ForegroundColor Cyan
    Write-Host "   Name: $($loginResponse.name)" -ForegroundColor Cyan
    Write-Host "   Email: $($loginResponse.email)" -ForegroundColor Cyan
    Write-Host "   Phone: $($loginResponse.phone)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Cyan
    Write-Host "   Is Admin: $($loginResponse.isAdmin)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Error details: $body" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n✅ Admin account setup and login test completed successfully!" -ForegroundColor Green
