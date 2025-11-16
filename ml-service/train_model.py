#!/usr/bin/env python3
"""
Training script for TensorFlow intent classifier
Run this script to train the AI model before using it in production
"""

from tf_intent_classifier import TensorFlowIntentClassifier
import os

def main():
    print("🤖 FarmTech AI Chatbot - Model Training")
    print("=" * 50)

    # Create classifier
    classifier = TensorFlowIntentClassifier()

    # Train the model
    print("Training the TensorFlow model...")
    print("This may take a few minutes...")
    print()

    history = classifier.train(epochs=50, batch_size=32)

    print()
    print("✅ Training completed!")
    print(".2f")
    print(".2f")
    print()
    print("📁 Model saved to: models/intent_classifier.h5")
    print("📁 Tokenizer saved to: models/intent_classifier_tokenizer.pkl")
    print("📁 Label encoder saved to: models/intent_classifier_label_encoder.pkl")
    print()
    print("🚀 To use AI in your chatbot, set environment variable:")
    print("   export USE_AI=true")
    print("   python app.py")

if __name__ == "__main__":
    main()