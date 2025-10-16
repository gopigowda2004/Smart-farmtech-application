# PowerShell script to register all user types from scratch

Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 20

$baseUrl = "http://localhost:8090/api/auth"

# Function to test registration
function Register-User {
    param($userData, $userType)
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body ($userData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✅ $userType registered successfully:" -ForegroundColor Green
        Write-Host "   User ID: $($response.userId)" -ForegroundColor Cyan
        Write-Host "   Role: $($response.role)" -ForegroundColor Cyan
        if ($response.farmerId) {
            Write-Host "   Farmer ID: $($response.farmerId)" -ForegroundColor Cyan
        }
        return $true
    } catch {
        Write-Host "❌ $userType registration failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Clear existing data first
Write-Host "🧹 Clearing existing data..." -ForegroundColor Yellow

# Register Admin
Write-Host "`n👑 Registering Admin..." -ForegroundColor Yellow
$adminData = @{
    email = "admin@farmtech.com"
    phone = "9999999999"
    password = "admin123"
    name = "Admin"
    fullName = "System Administrator"
    role = "ADMIN"
    address = "FarmTech Headquarters"
    district = "Bangalore"
    state = "Karnataka"
    pincode = "560001"
    farmSize = "N/A"
    cropType = "N/A"
    experience = "System Management"
    equipmentOwned = "All Equipment"
}

$adminSuccess = Register-User -userData $adminData -userType "Admin"

# Register Equipment Owner
Write-Host "`n🚜 Registering Equipment Owner..." -ForegroundColor Yellow
$ownerData = @{
    email = "owner@farmtech.com"
    phone = "9876543210"
    password = "owner123"
    name = "John Owner"
    fullName = "John Equipment Owner"
    role = "OWNER"
    address = "Rural Farm Area"
    district = "Mysore"
    state = "Karnataka"
    pincode = "570001"
    farmSize = "25 acres"
    cropType = "Rice, Sugarcane"
    experience = "20 years farming"
    equipmentOwned = "Tractor, Harvester, Rotavator"
}

$ownerSuccess = Register-User -userData $ownerData -userType "Owner"

# Register Equipment Renter
Write-Host "`n🌾 Registering Equipment Renter..." -ForegroundColor Yellow
$renterData = @{
    email = "renter@farmtech.com"
    phone = "9123456789"
    password = "renter123"
    name = "Jane Renter"
    fullName = "Jane Equipment Renter"
    role = "RENTER"
    address = "Small Farm Village"
    district = "Mandya"
    state = "Karnataka"
    pincode = "571401"
    farmSize = "5 acres"
    cropType = "Vegetables, Millets"
    experience = "8 years farming"
    equipmentOwned = "Basic hand tools"
}

$renterSuccess = Register-User -userData $renterData -userType "Renter"

# Summary
Write-Host "`n📊 Registration Summary:" -ForegroundColor Magenta
Write-Host "Admin: $(if($adminSuccess){'✅ Success'}else{'❌ Failed'})" -ForegroundColor $(if($adminSuccess){'Green'}else{'Red'})
Write-Host "Owner: $(if($ownerSuccess){'✅ Success'}else{'❌ Failed'})" -ForegroundColor $(if($ownerSuccess){'Green'}else{'Red'})
Write-Host "Renter: $(if($renterSuccess){'✅ Success'}else{'❌ Failed'})" -ForegroundColor $(if($renterSuccess){'Green'}else{'Red'})

if ($adminSuccess -and $ownerSuccess -and $renterSuccess) {
    Write-Host "`n🎉 All users registered successfully! System is ready." -ForegroundColor Green
    Write-Host "`nLogin Credentials:" -ForegroundColor Cyan
    Write-Host "Admin: 9999999999 / admin123" -ForegroundColor White
    Write-Host "Owner: 9876543210 / owner123" -ForegroundColor White
    Write-Host "Renter: 9123456789 / renter123" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some registrations failed. Check backend logs." -ForegroundColor Yellow
}