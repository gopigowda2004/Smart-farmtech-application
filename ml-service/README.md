# FarmTech AI Chatbot Service

Advanced bilingual chatbot with English ↔ Kannada translation support.

## Features

- ✅ **Bilingual Support**: English and Kannada
- ✅ **Real-time Translation**: Translate between English and Kannada
- ✅ **Context-Aware Responses**: Understands farming and equipment rental context
- ✅ **Intent Detection**: Automatically detects user intent
- ✅ **Smart Suggestions**: Provides relevant follow-up suggestions
- ✅ **Language Detection**: Automatically detects input language

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

## Running the Service

### Development Mode
```bash
python app.py
```

### Production Mode
```bash
gunicorn -w 4 -b 0.0.0.0:5002 app:app
```

The service will run on `http://localhost:5002`

## API Endpoints

### 1. Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "FarmTech AI Chatbot"
}
```

### 2. Chat
```
POST /api/chatbot/chat
```

Request:
```json
{
  "message": "How do I rent a tractor?",
  "language": "en",
  "context": {
    "farmerId": 123,
    "location": "Bangalore"
  }
}
```

Response:
```json
{
  "response": "Renting equipment is easy! 1) Search for equipment 2) Select dates 3) Send booking request 4) Owner confirms 5) Pick up equipment. Simple!",
  "language": "en",
  "detected_intent": "rental_process",
  "suggestions": ["Start booking", "View available equipment", "Booking requirements", "Payment info"]
}
```

### 3. Translate
```
POST /api/chatbot/translate
```

Request:
```json
{
  "text": "I need a tractor",
  "source_lang": "en",
  "target_lang": "kn"
}
```

Response:
```json
{
  "original": "I need a tractor",
  "translated": "ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು",
  "source_lang": "en",
  "target_lang": "kn"
}
```

### 4. Detect Language
```
POST /api/chatbot/detect-language
```

Request:
```json
{
  "text": "ನಮಸ್ಕಾರ"
}
```

Response:
```json
{
  "text": "ನಮಸ್ಕಾರ",
  "detected_language": "kn",
  "language_name": "Kannada"
}
```

## Supported Intents

1. **greeting** - Hello, Hi, Namaste
2. **equipment_search** - Finding equipment
3. **rental_process** - How to rent
4. **pricing** - Price information
5. **booking_status** - Check booking status
6. **help** - General help
7. **equipment_types** - Equipment categories
8. **thanks** - Thank you messages

## Example Usage

### English Chat
```bash
curl -X POST http://localhost:5002/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'
```

### Kannada Chat
```bash
curl -X POST http://localhost:5002/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ನಮಸ್ಕಾರ", "language": "kn"}'
```

### Translation
```bash
curl -X POST http://localhost:5002/api/chatbot/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "tractor", "source_lang": "en", "target_lang": "kn"}'
```

## Integration with Spring Boot Backend

The chatbot service is already configured in your Spring Boot application:

```properties
ml.enabled=true
ml.service.base=http://localhost:5002
```

Add chatbot endpoints to your MLController:

```java
@PostMapping("/chatbot/chat")
public ResponseEntity<?> chatbotChat(@RequestBody Map<String, Object> payload) {
    return forwardJson("/api/chatbot/chat", payload);
}

@PostMapping("/chatbot/translate")
public ResponseEntity<?> translate(@RequestBody Map<String, Object> payload) {
    return forwardJson("/api/chatbot/translate", payload);
}
```

## Extending the Chatbot

### Adding New Intents

Edit `chatbot.py` and add new intents to the `_load_intents()` method:

```python
"new_intent": {
    "patterns": [
        r"\bpattern1\b",
        r"\bpattern2\b"
    ],
    "responses": {
        "en": ["English response 1", "English response 2"],
        "kn": ["Kannada response 1", "Kannada response 2"]
    },
    "suggestions": {
        "en": ["Suggestion 1", "Suggestion 2"],
        "kn": ["ಸಲಹೆ 1", "ಸಲಹೆ 2"]
    }
}
```

### Adding New Translations

Edit `translator.py` and add new terms to `_load_en_to_kn_dict()`:

```python
"new_term": "ಹೊಸ_ಪದ",
```

## Testing

Test the chatbot with various queries:

- "Hello" / "ನಮಸ್ಕಾರ"
- "I need a tractor" / "ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು"
- "How to rent equipment?" / "ಉಪಕರಣ ಬಾಡಿಗೆ ಹೇಗೆ?"
- "What is the price?" / "ಬೆಲೆ ಎಷ್ಟು?"
- "Show my bookings" / "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ತೋರಿಸಿ"

## License

Part of FarmTech Equipment Rental Platform