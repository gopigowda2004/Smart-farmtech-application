# Register admin user
$adminData = @{
    email = "admin@farmtech.com"
    phone = "321456789"
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
} | ConvertTo-Json

Write-Host "Registering admin user..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8090/api/auth/register" -Method POST -Body $adminData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Admin registered successfully!" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-List
} catch {
    Write-Host "❌ Admin registration failed:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}