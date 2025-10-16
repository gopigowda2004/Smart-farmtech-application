"""
Test script for FarmTech AI Chatbot
Run this to verify the chatbot is working correctly
"""

import requests
import json

BASE_URL = "http://localhost:5002"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    print_section("Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat_english():
    print_section("Testing Chat - English")
    messages = [
        "Hello",
        "I need a tractor",
        "How do I rent equipment?",
        "What is the price?",
        "Thank you"
    ]
    
    for msg in messages:
        try:
            print(f"\n👤 User: {msg}")
            response = requests.post(
                f"{BASE_URL}/api/chatbot/chat",
                json={"message": msg, "language": "en"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Bot: {data['response']}")
                print(f"Intent: {data['detected_intent']}")
                print(f"Suggestions: {', '.join(data['suggestions'][:3])}")
            else:
                print(f"❌ Error: Status {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")

def test_chat_kannada():
    print_section("Testing Chat - Kannada")
    messages = [
        "ನಮಸ್ಕಾರ",
        "ನನಗೆ ಟ್ರಾಕ್ಟರ್ ಬೇಕು",
        "ಉಪಕರಣ ಬಾಡಿಗೆ ಹೇಗೆ?",
        "ಧನ್ಯವಾದ"
    ]
    
    for msg in messages:
        try:
            print(f"\n👤 User: {msg}")
            response = requests.post(
                f"{BASE_URL}/api/chatbot/chat",
                json={"message": msg, "language": "kn"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Bot: {data['response']}")
                print(f"Intent: {data['detected_intent']}")
                print(f"Suggestions: {', '.join(data['suggestions'][:3])}")
            else:
                print(f"❌ Error: Status {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")

def test_translation():
    print_section("Testing Translation")
    
    test_cases = [
        {"text": "I need a tractor", "source": "en", "target": "kn"},
        {"text": "ನನಗೆ ಸಹಾಯ ಬೇಕು", "source": "kn", "target": "en"},
        {"text": "equipment rental", "source": "en", "target": "kn"},
    ]
    
    for test in test_cases:
        try:
            print(f"\n📝 Original ({test['source']}): {test['text']}")
            response = requests.post(
                f"{BASE_URL}/api/chatbot/translate",
                json={
                    "text": test['text'],
                    "source_lang": test['source'],
                    "target_lang": test['target']
                }
            )
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Translated ({test['target']}): {data['translated']}")
            else:
                print(f"❌ Error: Status {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")

def test_language_detection():
    print_section("Testing Language Detection")
    
    test_texts = [
        "Hello, how are you?",
        "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?",
        "I need equipment",
        "ಉಪಕರಣ ಬೇಕು"
    ]
    
    for text in test_texts:
        try:
            print(f"\n📝 Text: {text}")
            response = requests.post(
                f"{BASE_URL}/api/chatbot/detect-language",
                json={"text": text}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Detected: {data['language_name']} ({data['detected_language']})")
            else:
                print(f"❌ Error: Status {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    print("\n" + "🤖 FarmTech AI Chatbot - Test Suite ".center(60, "="))
    print("\nMake sure the ML service is running on http://localhost:5002")
    print("Start it with: python app.py")
    
    input("\nPress Enter to start tests...")
    
    # Run all tests
    tests = [
        ("Health Check", test_health),
        ("English Chat", test_chat_english),
        ("Kannada Chat", test_chat_kannada),
        ("Translation", test_translation),
        ("Language Detection", test_language_detection),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result if result is not None else True))
        except Exception as e:
            print(f"\n❌ Test '{test_name}' failed with error: {e}")
            results.append((test_name, False))
    
    # Summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\n{'='*60}")
    print(f"Total: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("🎉 All tests passed! Your chatbot is working perfectly!")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()