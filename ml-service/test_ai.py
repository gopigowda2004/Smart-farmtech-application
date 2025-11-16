#!/usr/bin/env python3
"""
Test script for AI-powered chatbot
Tests both rule-based and AI-powered intent classification
"""

import os
import sys
sys.path.append('.')

from chatbot import BilingualChatbot
from personalized_chatbot import PersonalizedChatbot

def test_chatbot(use_ai=False):
    """Test chatbot with various inputs"""
    print(f"\n🤖 Testing {'AI-powered' if use_ai else 'Rule-based'} chatbot")
    print("=" * 60)

    # Initialize chatbot
    chatbot = BilingualChatbot(use_ai=use_ai)

    # Test cases
    test_cases = [
        ("Hello", "en"),
        ("I need a tractor", "en"),
        ("How much does it cost?", "en"),
        ("Show my bookings", "en"),
        ("ನಮಸ್ಕಾರ", "kn"),
        ("ನನಗೆ ಉಪಕರಣ ಬೇಕು", "kn"),
        ("ಬೆಲೆ ಎಷ್ಟು?", "kn"),
    ]

    for message, language in test_cases:
        print(f"\nInput: '{message}' ({language})")

        # Get response
        response = chatbot.get_response(message, language)
        detected_intent = response.get('intent', 'unknown')

        print(f"Detected Intent: {detected_intent}")
        print(f"Response: {response.get('answer', '')[:100]}...")

def test_personalized_chatbot(use_ai=False):
    """Test personalized chatbot"""
    print(f"\n👤 Testing {'AI-powered' if use_ai else 'Rule-based'} personalized chatbot")
    print("=" * 60)

    personalized_chatbot = PersonalizedChatbot(use_ai=use_ai)

    # Mock user data
    user_data = {
        'id': 1,
        'name': 'Test User',
        'role': 'farmer'
    }

    test_cases = [
        ("My bookings", "en"),
        ("Show my equipment", "en"),
        ("ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "kn"),
    ]

    for message, language in test_cases:
        print(f"\nInput: '{message}' ({language})")

        response = personalized_chatbot.get_response(message, language, user_data=user_data)
        detected_intent = response.get('detected_intent', 'unknown')

        print(f"Detected Intent: {detected_intent}")
        print(f"Response: {response.get('response', '')[:100]}...")

def main():
    print("🧪 FarmTech AI Chatbot Testing Suite")
    print("=" * 60)

    # Test rule-based first
    test_chatbot(use_ai=False)
    test_personalized_chatbot(use_ai=False)

    # Test AI if available
    try:
        test_chatbot(use_ai=True)
        test_personalized_chatbot(use_ai=True)
    except Exception as e:
        print(f"\n❌ AI testing failed: {e}")
        print("Make sure to train the model first: python train_model.py")
        print("And set USE_AI=true in environment")

    print("\n✅ Testing completed!")

if __name__ == "__main__":
    main()