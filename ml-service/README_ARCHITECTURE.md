# FarmTech AI Chatbot - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React Frontend - Port 3000)                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Chatbot Component                      │  │
│  │  • Floating chat button (💬)                             │  │
│  │  • Message display                                        │  │
│  │  • Language toggle (EN/KN)                                │  │
│  │  • Suggestion chips                                       │  │
│  │  • Input field                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP POST
                            │ /api/ml/chatbot/chat
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                 (Spring Boot - Port 8090)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MLController                           │  │
│  │  • chatbotChat()                                          │  │
│  │  • translate()                                            │  │
│  │  • detectLanguage()                                       │  │
│  │  • mlServiceHealth()                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ RestTemplate                        │
│                            │ Forward to ML Service               │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTP POST
                             │ /api/chatbot/chat
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ML SERVICE LAYER                            │
│                   (Python Flask - Port 5002)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Flask App (app.py)                     │  │
│  │  • /api/chatbot/chat                                      │  │
│  │  • /api/chatbot/translate                                 │  │
│  │  • /api/chatbot/detect-language                           │  │
│  │  • /health                                                │  │
│  └────────────────┬─────────────────────┬────────────────────┘  │
│                   │                     │                        │
│                   ↓                     ↓                        │
│  ┌────────────────────────┐  ┌──────────────────────────────┐  │
│  │  BilingualChatbot      │  │      Translator              │  │
│  │  (chatbot.py)          │  │      (translator.py)         │  │
│  │                        │  │                              │  │
│  │  • Intent Detection    │  │  • EN ↔ KN Translation      │  │
│  │  • Response Generation │  │  • Language Detection        │  │
│  │  • Suggestion Creation │  │  • 100+ Term Dictionary      │  │
│  │  • 8 Predefined Intents│  │                              │  │
│  └────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Sends Message

```
User types: "I need a tractor"
    ↓
Chatbot.js captures input
    ↓
Creates request:
{
  "message": "I need a tractor",
  "language": "en",
  "context": {
    "userId": "123",
    "location": "Bangalore"
  }
}
```

### 2. Frontend to Backend

```
React Component
    ↓
fetch('http://localhost:8090/api/ml/chatbot/chat', {
  method: 'POST',
  body: JSON.stringify(request)
})
    ↓
Spring Boot MLController receives request
```

### 3. Backend to ML Service

```
MLController.chatbotChat()
    ↓
RestTemplate forwards to:
http://localhost:5002/api/chatbot/chat
    ↓
Flask app.py receives request
```

### 4. ML Processing

```
Flask app.py
    ↓
BilingualChatbot.get_response()
    ↓
_detect_intent("I need a tractor")
    ↓
Matches pattern: r"\b(need|want)\b.*\b(tractor)\b"
    ↓
Intent: "equipment_search"
    ↓
Selects random response from intent["responses"]["en"]
    ↓
Gets suggestions from intent["suggestions"]["en"]
    ↓
Returns:
{
  "answer": "I can help you find equipment!...",
  "intent": "equipment_search",
  "suggestions": ["Show tractors", "Show harvesters", ...]
}
```

### 5. Response Back to User

```
Flask returns JSON
    ↓
Spring Boot forwards response
    ↓
React receives response
    ↓
Chatbot.js updates state
    ↓
UI displays:
  • Bot message
  • Suggestion chips
  • Timestamp
```

## Component Details

### Frontend (React)

**Chatbot.js**
```javascript
State:
  - isOpen: boolean
  - messages: Array<Message>
  - inputMessage: string
  - language: 'en' | 'kn'
  - isLoading: boolean
  - suggestions: Array<string>

Methods:
  - sendMessage()
  - addBotMessage()
  - addUserMessage()
  - toggleLanguage()
  - handleSuggestionClick()
```

**Chatbot.css**
```css
Components:
  - .chatbot-toggle (floating button)
  - .chatbot-window (main container)
  - .chatbot-header (title + controls)
  - .chatbot-messages (message list)
  - .chatbot-suggestions (suggestion chips)
  - .chatbot-input (input field + send button)

Features:
  - Animations (slideUp, fadeIn, typing)
  - Responsive design
  - Dark mode support
  - Gradient backgrounds
```

### Backend (Spring Boot)

**MLController.java**
```java
Endpoints:
  POST /api/ml/chatbot/chat
  POST /api/ml/chatbot/translate
  POST /api/ml/chatbot/detect-language
  GET  /api/ml/health

Configuration:
  @Value("${ml.service.base}")
  private String mlServiceBase;

Features:
  - Request forwarding
  - Error handling
  - CORS support
  - Conditional loading (@ConditionalOnProperty)
```

### ML Service (Python)

**app.py**
```python
Endpoints:
  POST /api/chatbot/chat
  POST /api/chatbot/translate
  POST /api/chatbot/detect-language
  GET  /health

Dependencies:
  - Flask (web framework)
  - flask-cors (CORS support)
  - python-dotenv (environment variables)

Features:
  - JSON request/response
  - Error handling
  - CORS configuration
```

**chatbot.py**
```python
Class: BilingualChatbot

Intents:
  1. greeting
  2. equipment_search
  3. rental_process
  4. pricing
  5. booking_status
  6. help
  7. equipment_types
  8. thanks

Methods:
  - get_response(message, language, context)
  - _detect_intent(message)
  - _load_intents()
  - _get_default_response(language)
  - _get_default_suggestions(language)

Data Structure:
{
  "intent_name": {
    "patterns": [regex patterns],
    "responses": {
      "en": [English responses],
      "kn": [Kannada responses]
    },
    "suggestions": {
      "en": [English suggestions],
      "kn": [Kannada suggestions]
    }
  }
}
```

**translator.py**
```python
Class: Translator

Methods:
  - translate(text, source_lang, target_lang)
  - detect_language(text)
  - _translate_en_to_kn(text)
  - _translate_kn_to_en(text)
  - _load_en_to_kn_dict()
  - _load_kn_to_en_dict()

Dictionary:
  100+ terms covering:
  - Greetings
  - Equipment names
  - Rental terms
  - Actions
  - Status
  - Pricing
  - Location
  - User terms
  - Questions
  - Common words
  - Farm related
  - Time
```

## Intent Detection Algorithm

```python
def _detect_intent(message):
    message_lower = message.lower()
    
    for intent_name, intent_data in intents.items():
        for pattern in intent_data["patterns"]:
            if re.search(pattern, message_lower, re.IGNORECASE):
                return intent_name
    
    return "general"
```

**Example:**
```
Input: "I need a tractor"
    ↓
Lowercase: "i need a tractor"
    ↓
Check patterns:
  - greeting: ❌ No match
  - equipment_search: ✅ Match!
    Pattern: r"\b(need|want)\b.*\b(tractor)\b"
    ↓
Return: "equipment_search"
```

## Translation Algorithm

```python
def _translate_en_to_kn(text):
    translated = text.lower()
    
    # Sort by length (longest first)
    sorted_terms = sorted(en_to_kn.items(), 
                         key=lambda x: len(x[0]), 
                         reverse=True)
    
    for en_term, kn_term in sorted_terms:
        pattern = r'\b' + re.escape(en_term) + r'\b'
        translated = re.sub(pattern, kn_term, translated)
    
    return translated
```

**Example:**
```
Input: "I need a tractor"
    ↓
Lowercase: "i need a tractor"
    ↓
Replace terms:
  "need" → "ಬೇಕು"
  "tractor" → "ಟ್ರಾಕ್ಟರ್"
    ↓
Output: "i ಬೇಕು a ಟ್ರಾಕ್ಟರ್"
```

## Language Detection Algorithm

```python
def detect_language(text):
    # Check for Kannada Unicode range (0C80-0CFF)
    kannada_pattern = r'[\u0C80-\u0CFF]'
    
    if re.search(kannada_pattern, text):
        return "kn"
    else:
        return "en"
```

**Example:**
```
Input: "ನಮಸ್ಕಾರ"
    ↓
Check Unicode: \u0CA8\u0CAE\u0CB8\u0CCD\u0C95\u0CBE\u0CB0
    ↓
Range: 0C80-0CFF ✅
    ↓
Return: "kn"
```

## State Management

### Frontend State Flow

```
Initial State:
  isOpen: false
  messages: []
  language: 'en'
  suggestions: []

User clicks button:
  isOpen: true
  messages: [greeting message]
  suggestions: [default suggestions]

User types message:
  inputMessage: "I need a tractor"

User sends message:
  messages: [...prev, user message]
  isLoading: true
  inputMessage: ""

Response received:
  messages: [...prev, bot message]
  suggestions: [new suggestions]
  isLoading: false

User switches language:
  language: 'kn'
  messages: []
  suggestions: []
```

## Error Handling

### Frontend
```javascript
try {
  const response = await fetch(url, options);
  if (response.ok) {
    // Handle success
  } else {
    // Show error message
    addBotMessage("Sorry, I'm having trouble...");
  }
} catch (error) {
  // Network error
  addBotMessage("Sorry, I'm currently unavailable...");
}
```

### Backend
```java
try {
    ResponseEntity<String> response = restTemplate.postForEntity(...);
    return ResponseEntity.status(response.getStatusCode())
                        .body(response.getBody());
} catch (Exception e) {
    return ResponseEntity.status(503)
                        .body("{\"error\":\"" + e.getMessage() + "\"}");
}
```

### ML Service
```python
try:
    # Process request
    response = chatbot.get_response(message, language, context)
    return jsonify(response), 200
except Exception as e:
    return jsonify({"error": str(e)}), 500
```

## Performance Optimization

### Caching (Future Enhancement)
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_response(message, language):
    return chatbot.get_response(message, language)
```

### Connection Pooling
```java
@Bean
public RestTemplate restTemplate() {
    HttpComponentsClientHttpRequestFactory factory = 
        new HttpComponentsClientHttpRequestFactory();
    factory.setConnectTimeout(5000);
    factory.setReadTimeout(5000);
    return new RestTemplate(factory);
}
```

## Security Considerations

### Input Validation
```python
def validate_input(data):
    if not data.get('message'):
        raise ValueError("Message is required")
    
    if len(data['message']) > 1000:
        raise ValueError("Message too long")
    
    if data.get('language') not in ['en', 'kn']:
        raise ValueError("Invalid language")
```

### CORS Configuration
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

## Monitoring & Logging

### Backend Logging
```java
@Slf4j
@RestController
public class MLController {
    @PostMapping("/chatbot/chat")
    public ResponseEntity<?> chatbotChat(@RequestBody Map<String, Object> payload) {
        log.info("Chatbot request: {}", payload.get("message"));
        // Process request
        log.info("Chatbot response sent");
        return response;
    }
}
```

### ML Service Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/chatbot/chat', methods=['POST'])
def chat():
    logger.info(f"Chat request: {request.json}")
    # Process request
    logger.info(f"Chat response: {response}")
    return jsonify(response)
```

## Testing Strategy

### Unit Tests
```python
def test_intent_detection():
    chatbot = BilingualChatbot()
    assert chatbot._detect_intent("hello") == "greeting"
    assert chatbot._detect_intent("I need a tractor") == "equipment_search"
```

### Integration Tests
```python
def test_chat_endpoint():
    response = client.post('/api/chatbot/chat', json={
        'message': 'hello',
        'language': 'en'
    })
    assert response.status_code == 200
    assert 'response' in response.json
```

### End-to-End Tests
```javascript
describe('Chatbot', () => {
  it('should send and receive messages', async () => {
    render(<Chatbot />);
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });
  });
});
```

## Deployment Architecture

### Development
```
localhost:3000 (React)
    ↓
localhost:8090 (Spring Boot)
    ↓
localhost:5002 (Python)
```

### Production
```
farmtech.com (Nginx)
    ↓
backend.farmtech.com (Spring Boot + Load Balancer)
    ↓
ml.farmtech.com (Python + Gunicorn + Load Balancer)
```

## Scalability

### Horizontal Scaling
```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    ML Service 1    ML Service 2    ML Service 3
    (Port 5002)     (Port 5003)     (Port 5004)
```

### Vertical Scaling
```
Increase resources:
  - CPU: 2 cores → 4 cores
  - RAM: 2GB → 4GB
  - Workers: 4 → 8
```

---

This architecture provides a solid foundation for a production-ready bilingual chatbot system!