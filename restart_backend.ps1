# Restart Backend Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restarting FarmTech Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any existing backend process
Write-Host "Stopping existing backend process..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*spring-boot*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting Spring Boot Backend..." -ForegroundColor Green
Set-Location "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend'; mvn spring-boot:run"

Write-Host ""
Write-Host "Backend is starting..." -ForegroundColor Green
Write-Host "It will be available at: http://localhost:8090" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")