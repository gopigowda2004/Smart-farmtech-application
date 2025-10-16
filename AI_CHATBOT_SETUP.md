# 🤖 FarmTech AI Chatbot - Complete Setup Guide

## Overview

Your FarmTech application now has an **advanced bilingual AI chatbot** with:
- ✅ **English & Kannada** support
- ✅ **Real-time translation** between languages
- ✅ **Context-aware responses** about equipment rental
- ✅ **Smart suggestions** for user queries
- ✅ **Beautiful UI** with floating chat widget
- ✅ **Language detection** and switching

---

## 🚀 Quick Start

### Step 1: Install Python ML Service

1. **Navigate to ml-service directory:**
```powershell
cd "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\ml-service"
```

2. **Install Python dependencies:**
```powershell
pip install -r requirements.txt
```

3. **Start the ML service:**
```powershell
python app.py
```

The service will start on `http://localhost:5002`

### Step 2: Start Spring Boot Backend

1. **Navigate to backend directory:**
```powershell
cd "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend"
```

2. **Run the backend:**
```powershell
mvn spring-boot:run
```

Or if already compiled:
```powershell
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The backend will start on `http://localhost:8090`

### Step 3: Start React Frontend

1. **Navigate to frontend directory:**
```powershell
cd "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\farmer-rental-app"
```

2. **Install dependencies (if not already done):**
```powershell
npm install
```

3. **Start the frontend:**
```powershell
npm start
```

The frontend will start on `http://localhost:3000`

---

## 🎯 Testing the Chatbot

### 1. Open Your Application
Navigate to `http://localhost:3000`

### 2. Look for the Chatbot Button
You'll see a purple floating button (💬) in the bottom-right corner

### 3. Click to Open
Click the button to open the chatbot window

### 4. Try These Queries:

**English:**
- "Hello"
- "I need a tractor"
- "How do I rent equipment?"
- "What is the price?"
- "Show my bookings"
- "Help me find a harvester"

**Kannada:**
- "ನಮಸ್ಕಾರ"
- "ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು"
- "ಉಪಕರಣ ಬಾಡಿಗೆ ಹೇಗೆ?"
- "ಬೆಲೆ ಎಷ್ಟು?"
- "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ತೋರಿಸಿ"

### 5. Switch Languages
Click the language toggle button in the chatbot header to switch between English and Kannada

---

## 📡 API Endpoints

### Backend Endpoints (via Spring Boot)

All chatbot endpoints are available at `http://localhost:8090/api/ml/`

#### 1. Chat with Bot
```
POST /api/ml/chatbot/chat
```

**Request:**
```json
{
  "message": "I need a tractor",
  "language": "en",
  "context": {
    "userId": "123",
    "location": "Bangalore"
  }
}
```

**Response:**
```json
{
  "response": "I can help you find equipment! What type of equipment are you looking for?",
  "language": "en",
  "detected_intent": "equipment_search",
  "suggestions": ["Show tractors", "Show harvesters", "Equipment near me"]
}
```

#### 2. Translate Text
```
POST /api/ml/chatbot/translate
```

**Request:**
```json
{
  "text": "I need a tractor",
  "source_lang": "en",
  "target_lang": "kn"
}
```

**Response:**
```json
{
  "original": "I need a tractor",
  "translated": "ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು",
  "source_lang": "en",
  "target_lang": "kn"
}
```

#### 3. Detect Language
```
POST /api/ml/chatbot/detect-language
```

**Request:**
```json
{
  "text": "ನಮಸ್ಕಾರ"
}
```

**Response:**
```json
{
  "text": "ನಮಸ್ಕಾರ",
  "detected_language": "kn",
  "language_name": "Kannada"
}
```

#### 4. Check ML Service Health
```
GET /api/ml/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "FarmTech AI Chatbot"
}
```

---

## 🎨 Chatbot Features

### 1. **Bilingual Support**
- Seamlessly switch between English and Kannada
- Automatic language detection
- Context preserved across language switches

### 2. **Smart Intent Detection**
The chatbot understands these intents:
- **Greeting** - Hello, Hi, Namaste
- **Equipment Search** - Finding equipment
- **Rental Process** - How to rent
- **Pricing** - Price information
- **Booking Status** - Check bookings
- **Help** - General assistance
- **Equipment Types** - Tractor, harvester, etc.
- **Thanks** - Gratitude expressions

### 3. **Contextual Suggestions**
After each response, the bot provides relevant suggestions to guide the conversation

### 4. **Beautiful UI**
- Modern floating chat widget
- Smooth animations
- Typing indicators
- Message timestamps
- Responsive design
- Dark mode support

---

## 🔧 Customization

### Adding New Intents

Edit `ml-service/chatbot.py` and add to `_load_intents()`:

```python
"your_intent": {
    "patterns": [
        r"\byour pattern\b",
        r"\bಕನ್ನಡ pattern\b"
    ],
    "responses": {
        "en": ["English response 1", "English response 2"],
        "kn": ["ಕನ್ನಡ response 1", "ಕನ್ನಡ response 2"]
    },
    "suggestions": {
        "en": ["Suggestion 1", "Suggestion 2"],
        "kn": ["ಸಲಹೆ 1", "ಸಲಹೆ 2"]
    }
}
```

### Adding New Translations

Edit `ml-service/translator.py` and add to `_load_en_to_kn_dict()`:

```python
"english_word": "ಕನ್ನಡ_ಪದ",
```

### Customizing UI

Edit `farmer-rental-app/src/components/Chatbot.css`:
- Change colors in gradient backgrounds
- Adjust sizes and spacing
- Modify animations
- Update responsive breakpoints

---

## 🐛 Troubleshooting

### Issue: Chatbot button not showing
**Solution:** 
- Check browser console for errors
- Ensure Chatbot component is imported in App.js
- Clear browser cache and reload

### Issue: "ML service unavailable" error
**Solution:**
- Check if Python ML service is running on port 5002
- Test: `curl http://localhost:5002/health`
- Check firewall settings

### Issue: Backend can't connect to ML service
**Solution:**
- Verify `application.properties` has correct ML service URL
- Check if both services are running
- Test backend health: `curl http://localhost:8090/api/ml/health`

### Issue: Kannada text not displaying
**Solution:**
- Ensure your browser supports Kannada Unicode
- Check font settings in CSS
- Install Kannada language support in Windows

### Issue: Translation not working
**Solution:**
- Check Python service logs for errors
- Verify translator.py has the required terms
- Test translation endpoint directly

---

## 📊 Monitoring

### Check Service Status

**ML Service:**
```powershell
curl http://localhost:5002/health
```

**Backend ML Proxy:**
```powershell
curl http://localhost:8090/api/ml/health
```

### View Logs

**Python ML Service:**
Check console where `python app.py` is running

**Spring Boot Backend:**
Check console or `logs/spring-boot-application.log`

**React Frontend:**
Check browser console (F12)

---

## 🚀 Production Deployment

### 1. Update Configuration

**application.properties:**
```properties
ml.service.base=http://your-ml-service-url:5002
```

### 2. Deploy ML Service

**Using Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5002 app:app
```

**Using Docker:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5002", "app:app"]
```

### 3. Environment Variables

Set these in production:
```
PORT=5002
FLASK_ENV=production
```

---

## 📈 Future Enhancements

### Planned Features:
1. **Voice Input** - Speak in English or Kannada
2. **Image Recognition** - Upload equipment photos
3. **Advanced NLP** - Better intent understanding
4. **Chat History** - Save conversation history
5. **Multi-language** - Add more Indian languages
6. **AI Integration** - Connect to GPT/Gemini for advanced queries
7. **Analytics** - Track common queries and improve responses

---

## 🎓 How It Works

### Architecture:

```
User (Browser)
    ↓
React Chatbot Component
    ↓
Spring Boot Backend (/api/ml/chatbot/*)
    ↓
Python Flask ML Service (port 5002)
    ↓
BilingualChatbot + Translator
    ↓
Response back to User
```

### Flow:

1. User types message in chatbot
2. React sends to Spring Boot backend
3. Backend forwards to Python ML service
4. ML service detects intent and language
5. Generates appropriate response
6. Returns response with suggestions
7. React displays in beautiful UI

---

## 📝 Testing Checklist

- [ ] ML service starts without errors
- [ ] Backend connects to ML service
- [ ] Frontend displays chatbot button
- [ ] Chatbot opens on click
- [ ] English messages work
- [ ] Kannada messages work
- [ ] Language switching works
- [ ] Suggestions are clickable
- [ ] Translation endpoint works
- [ ] Language detection works
- [ ] Mobile responsive design works
- [ ] Dark mode works (if enabled)

---

## 🎉 Success!

Your FarmTech application now has a fully functional bilingual AI chatbot!

**Key Benefits:**
- ✅ Better user experience
- ✅ 24/7 automated support
- ✅ Language accessibility for Kannada farmers
- ✅ Reduced support workload
- ✅ Improved engagement

**Next Steps:**
1. Test thoroughly with real users
2. Gather feedback
3. Add more intents based on common queries
4. Expand translation dictionary
5. Consider adding more languages

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review service logs
3. Test each component individually
4. Verify all services are running

---

## 🏆 Congratulations!

You've successfully implemented an advanced AI chatbot for your FarmTech platform! 🎊

The chatbot will help farmers in both English and Kannada, making your platform more accessible and user-friendly.

Happy Farming! 🚜🌾