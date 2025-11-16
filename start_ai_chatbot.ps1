# FarmTech AI Chatbot Startup Script
# This script trains the AI model and starts the chatbot service with AI enabled

Write-Host "🤖 FarmTech AI Chatbot Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "ml-service")) {
    Write-Host "❌ Error: ml-service directory not found. Run this script from the project root." -ForegroundColor Red
    exit 1
}

# Navigate to ml-service directory
Set-Location ml-service

# Check Python installation
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Train the AI model
Write-Host "`n🧠 Training AI model..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Yellow
python train_model.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Model training failed" -ForegroundColor Red
    exit 1
}

# Enable AI in environment
Write-Host "`n⚙️ Enabling AI features..." -ForegroundColor Yellow
$envContent = Get-Content .env -ErrorAction SilentlyContinue
if ($envContent -notcontains "USE_AI=true") {
    Add-Content .env "USE_AI=true"
}

# Start the service
Write-Host "`n🚀 Starting AI-powered chatbot service..." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:5002" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Set environment variable for this session
$env:USE_AI = "true"

# Start the Flask app
python app.py