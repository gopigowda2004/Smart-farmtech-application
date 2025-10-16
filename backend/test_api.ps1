# PowerShell script to test the new registration API

# Wait for backend to be ready
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 10

# Test 1: Register Admin
Write-Host "Registering Admin..."
$adminData = @{
    email = "admin@farmtech.com"
    phone = "9999999999"
    password = "admin123"
    name = "Admin"
    fullName = "System Administrator"
    role = "ADMIN"
    address = "FarmTech HQ"
    district = "Bangalore"
    state = "Karnataka"
    pincode = "560001"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "Admin registered successfully: $($adminResponse | ConvertTo-Json)"
} catch {
    Write-Host "Admin registration failed: $($_.Exception.Message)"
}

# Test 2: Register Owner
Write-Host "Registering Owner..."
$ownerData = @{
    email = "owner@example.com"
    phone = "9876543210"
    password = "owner123"
    name = "John Owner"
    fullName = "John Equipment Owner"
    role = "OWNER"
    address = "Farm Address"
    district = "Rural District"
    state = "Karnataka"
    pincode = "560002"
    farmSize = "10 acres"
    cropType = "Rice"
    experience = "15 years"
    equipmentOwned = "Tractor, Harvester"
} | ConvertTo-Json

try {
    $ownerResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $ownerData -ContentType "application/json"
    Write-Host "Owner registered successfully: $($ownerResponse | ConvertTo-Json)"
} catch {
    Write-Host "Owner registration failed: $($_.Exception.Message)"
}

# Test 3: Register Renter
Write-Host "Registering Renter..."
$renterData = @{
    email = "renter@example.com"
    phone = "9123456789"
    password = "renter123"
    name = "Jane Renter"
    fullName = "Jane Equipment Renter"
    role = "RENTER"
    address = "Renter Address"
    district = "City District"
    state = "Karnataka"
    pincode = "560003"
    farmSize = "2 acres"
    cropType = "Vegetables"
    experience = "5 years"
} | ConvertTo-Json

try {
    $renterResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $renterData -ContentType "application/json"
    Write-Host "Renter registered successfully: $($renterResponse | ConvertTo-Json)"
} catch {
    Write-Host "Renter registration failed: $($_.Exception.Message)"
}

Write-Host "Registration tests completed!"