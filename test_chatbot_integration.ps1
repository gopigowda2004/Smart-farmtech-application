# FarmTech Chatbot Integration Test Script
# Tests the complete flow: Frontend -> Backend -> ML Service

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FarmTech Chatbot Integration Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: ML Service Health
Write-Host "Test 1: ML Service Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5002/health" -Method Get
    Write-Host "✅ ML Service is healthy" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ ML Service is not responding" -ForegroundColor Red
    Write-Host "   Make sure to start: python ml-service/app.py" -ForegroundColor Yellow
}

# Test 2: Backend ML Proxy Health
Write-Host "`nTest 2: Backend ML Proxy Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/ml/health" -Method Get
    Write-Host "✅ Backend ML proxy is working" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "   Make sure to start: mvn spring-boot:run" -ForegroundColor Yellow
}

# Test 3: Chat in English
Write-Host "`nTest 3: Chat in English" -ForegroundColor Yellow
try {
    $body = @{
        message = "Hello, I need a tractor"
        language = "en"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/ml/chatbot/chat" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ English chat working" -ForegroundColor Green
    Write-Host "   User: Hello, I need a tractor" -ForegroundColor Gray
    Write-Host "   Bot: $($response.response)" -ForegroundColor Gray
    Write-Host "   Intent: $($response.detected_intent)" -ForegroundColor Gray
} catch {
    Write-Host "❌ English chat failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test 4: Chat in Kannada
Write-Host "`nTest 4: Chat in Kannada" -ForegroundColor Yellow
try {
    $body = @{
        message = "ನಮಸ್ಕಾರ, ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು"
        language = "kn"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/ml/chatbot/chat" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ Kannada chat working" -ForegroundColor Green
    Write-Host "   User: ನಮಸ್ಕಾರ, ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು" -ForegroundColor Gray
    Write-Host "   Bot: $($response.response)" -ForegroundColor Gray
    Write-Host "   Intent: $($response.detected_intent)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Kannada chat failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test 5: Translation
Write-Host "`nTest 5: Translation (English to Kannada)" -ForegroundColor Yellow
try {
    $body = @{
        text = "I need a tractor"
        source_lang = "en"
        target_lang = "kn"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/ml/chatbot/translate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ Translation working" -ForegroundColor Green
    Write-Host "   Original: $($response.original)" -ForegroundColor Gray
    Write-Host "   Translated: $($response.translated)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Translation failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test 6: Language Detection
Write-Host "`nTest 6: Language Detection" -ForegroundColor Yellow
try {
    $body = @{
        text = "ನಮಸ್ಕಾರ"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/ml/chatbot/detect-language" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ Language detection working" -ForegroundColor Green
    Write-Host "   Text: $($response.text)" -ForegroundColor Gray
    Write-Host "   Detected: $($response.language_name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Language detection failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Look for the chatbot button (💬) in bottom-right" -ForegroundColor White
Write-Host "3. Click to open and start chatting!" -ForegroundColor White
Write-Host "4. Try switching between English and Kannada`n" -ForegroundColor White