# FarmTech - Start All Services
# This script starts ML Service, Backend, and Frontend

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚜 FarmTech - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$rootDir = "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34"

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🚀 $Name' -ForegroundColor $Color; $Command"
    Start-Sleep -Seconds 2
}

# Check if Python is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit
}

Write-Host "`n"

# Start ML Service
Start-Service -Name "ML Service (Python)" `
    -Path "$rootDir\ml-service" `
    -Command "python app.py" `
    -Color "Magenta"

Write-Host "⏳ Waiting for ML Service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Backend
Start-Service -Name "Backend (Spring Boot)" `
    -Path "$rootDir\backend" `
    -Command "mvn spring-boot:run" `
    -Color "Blue"

Write-Host "⏳ Waiting for Backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Frontend
Start-Service -Name "Frontend (React)" `
    -Path "$rootDir\farmer-rental-app" `
    -Command "npm start" `
    -Color "Green"

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ All Services Started!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  🐍 ML Service:  http://localhost:5002" -ForegroundColor Magenta
Write-Host "  ☕ Backend:     http://localhost:8090" -ForegroundColor Blue
Write-Host "  ⚛️  Frontend:    http://localhost:3000" -ForegroundColor Green

Write-Host "`nThe application will open automatically in your browser." -ForegroundColor White
Write-Host "Look for the chatbot button (💬) in the bottom-right corner!`n" -ForegroundColor White

Write-Host "To stop all services, close all PowerShell windows.`n" -ForegroundColor Yellow

# Wait a bit and open browser
Start-Sleep -Seconds 15
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")