# Restart Services for Personalized Chatbot
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restarting for Personalized Chatbot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install new Python dependency
Write-Host "Step 1: Installing Python dependencies..." -ForegroundColor Yellow
Set-Location "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\ml-service"
pip install requests
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Stop existing processes
Write-Host "Step 2: Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*ml-service*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*spring-boot*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 3: Start ML Service
Write-Host "Step 3: Starting ML Service..." -ForegroundColor Yellow
Set-Location "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\ml-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\ml-service'; Write-Host 'ML Service Starting...' -ForegroundColor Cyan; python app.py"
Start-Sleep -Seconds 3
Write-Host "✅ ML Service started on port 5002" -ForegroundColor Green
Write-Host ""

# Step 4: Start Backend
Write-Host "Step 4: Starting Spring Boot Backend..." -ForegroundColor Yellow
Set-Location "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend'; Write-Host 'Backend Starting...' -ForegroundColor Cyan; mvn spring-boot:run"
Write-Host "✅ Backend starting on port 8090" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Services Restarted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  ✅ ML Service: http://localhost:5002" -ForegroundColor White
Write-Host "  ✅ Backend: http://localhost:8090" -ForegroundColor White
Write-Host "  ℹ️  Frontend: http://localhost:3000 (already running)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 30 seconds for backend to fully start" -ForegroundColor White
Write-Host "  2. Open http://localhost:3000" -ForegroundColor White
Write-Host "  3. Login to your account" -ForegroundColor White
Write-Host "  4. Open chatbot (💬 button)" -ForegroundColor White
Write-Host "  5. Try: 'Show my profile' or 'My bookings'" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  📖 PERSONALIZED_CHATBOT_GUIDE.md - Complete guide" -ForegroundColor White
Write-Host "  📋 PERSONALIZED_CHATBOT_SUMMARY.md - Quick summary" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")