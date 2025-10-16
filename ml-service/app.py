from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from chatbot import BilingualChatbot
from personalized_chatbot import PersonalizedChatbot
from translator import Translator
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize chatbots and translator
chatbot = BilingualChatbot()
personalized_chatbot = PersonalizedChatbot()
translator = Translator()

# Backend API base URL
BACKEND_API_BASE = "http://localhost:8090"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "FarmTech AI Chatbot"}), 200

@app.route('/api/chatbot/chat', methods=['POST'])
def chat():
    """
    Handle chat requests in English or Kannada with personalization
    Request body: {
        "message": "user message",
        "language": "en" or "kn",
        "context": {
            "userId": "user ID" (optional),
            "location": "user location" (optional)
        }
    }
    """
    try:
        data = request.json
        message = data.get('message', '')
        language = data.get('language', 'en')
        context = data.get('context', {})
        user_id = context.get('userId')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Fetch user data if userId is provided
        user_data = None
        if user_id:
            try:
                user_response = requests.get(
                    f"{BACKEND_API_BASE}/api/chatbot-data/user/{user_id}",
                    timeout=5
                )
                if user_response.status_code == 200:
                    user_data = user_response.json()
            except Exception as e:
                print(f"Failed to fetch user data: {e}")
                # Continue without user data
        
        # Use personalized chatbot if user data is available
        if user_data:
            response = personalized_chatbot.get_response(message, language, context, user_data)
        else:
            # Fall back to basic chatbot
            basic_response = chatbot.get_response(message, language, context)
            response = {
                "response": basic_response['answer'],
                "language": language,
                "detected_intent": basic_response.get('intent', 'general'),
                "suggestions": basic_response.get('suggestions', [])
            }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chatbot/translate', methods=['POST'])
def translate():
    """
    Translate text between English and Kannada
    Request body: {
        "text": "text to translate",
        "source_lang": "en" or "kn",
        "target_lang": "en" or "kn"
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'kn')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        translated_text = translator.translate(text, source_lang, target_lang)
        
        return jsonify({
            "original": text,
            "translated": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chatbot/detect-language', methods=['POST'])
def detect_language():
    """
    Detect if text is in English or Kannada
    Request body: {
        "text": "text to detect"
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        detected_lang = translator.detect_language(text)
        
        return jsonify({
            "text": text,
            "detected_language": detected_lang,
            "language_name": "Kannada" if detected_lang == "kn" else "English"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)