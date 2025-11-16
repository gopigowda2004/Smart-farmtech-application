import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import json
import os
import pickle

class TensorFlowIntentClassifier:
    """
    TensorFlow-based intent classifier for FarmTech chatbot
    Uses a neural network to classify user intents more accurately than rule-based regex
    """

    def __init__(self, model_path='models/intent_classifier'):
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        self.label_encoder = None
        self.max_length = 50

        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)

        # Load or create model
        if os.path.exists(f"{model_path}.h5"):
            self.load_model()
        else:
            self.build_model()

    def build_model(self):
        """Build the neural network model"""
        self.model = keras.Sequential([
            keras.layers.Embedding(input_dim=5000, output_dim=64, input_length=self.max_length),
            keras.layers.Bidirectional(keras.layers.LSTM(64, return_sequences=True)),
            keras.layers.Bidirectional(keras.layers.LSTM(32)),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(len(self.get_intent_labels()), activation='softmax')
        ])

        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

    def get_intent_labels(self):
        """Get all possible intent labels"""
        return [
            "greeting", "equipment_search", "rental_process", "pricing",
            "booking_status", "help", "equipment_types", "thanks",
            "my_profile", "my_bookings", "my_equipment", "pending_requests",
            "cancel_booking", "approve_request", "reject_request", "general"
        ]

    def prepare_training_data(self):
        """Prepare training data from the existing rule-based intents"""
        training_data = []

        # Sample training phrases for each intent
        intent_examples = {
            "greeting": [
                "hello", "hi", "hey", "namaste", "namaskar", "good morning",
                "good afternoon", "good evening", "how are you", "hi there",
                "ನಮಸ್ಕಾರ", "ಹಲೋ", "ನಮಸ್ತೆ"
            ],
            "equipment_search": [
                "find tractor", "looking for harvester", "need plough", "search equipment",
                "show me tractors", "find farming tools", "looking for rental equipment",
                "ಉಪಕರಣ ಹುಡುಕಿ", "ಟ್ರಾಕ್ಟರ್ ಬೇಕು", "ಹಾರ್ವೆಸ್ಟರ್ ಹುಡುಕುತ್ತಿದ್ದೇನೆ"
            ],
            "rental_process": [
                "how to rent", "how do I book equipment", "rental steps", "booking process",
                "how to make a booking", "steps for renting", "how to rent tractor",
                "ಬಾಡಿಗೆ ಹೇಗೆ", "ಬುಕಿಂಗ್ ಪ್ರಕ್ರಿಯೆ", "ಉಪಕರಣ ಬಾಡಿಗೆ ಮಾಡುವುದು ಹೇಗೆ"
            ],
            "pricing": [
                "how much does it cost", "equipment prices", "rental rates", "pricing info",
                "cost of tractor", "how much for harvester", "price range",
                "ಬೆಲೆ ಎಷ್ಟು", "ಉಪಕರಣ ಬೆಲೆಗಳು", "ದರ ಏನು"
            ],
            "booking_status": [
                "my bookings", "booking status", "view my rentals", "check booking",
                "my rental history", "booking details", "track my booking",
                "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಬುಕಿಂಗ್ ಸ್ಥಿತಿ", "ನನ್ನ ಬಾಡಿಗೆಗಳು"
            ],
            "help": [
                "help me", "I need help", "support", "assist me", "what can you do",
                "how can you help", "need assistance", "ಸಹಾಯ ಬೇಕು", "ನನಗೆ ಸಹಾಯ ಮಾಡಿ"
            ],
            "equipment_types": [
                "what equipment do you have", "types of equipment", "available machines",
                "farming equipment list", "what tractors", "show harvesters",
                "ಉಪಕರಣ ಪ್ರಕಾರಗಳು", "ಯಾವ ಉಪಕರಣಗಳಿವೆ", "ಯಂತ್ರಗಳ ಪಟ್ಟಿ"
            ],
            "thanks": [
                "thank you", "thanks", "appreciate it", "thank you very much",
                "grateful", "thanks a lot", "ಧನ್ಯವಾದಗಳು", "ಧನ್ಯವಾದ"
            ],
            "my_profile": [
                "my profile", "my account", "my details", "who am I", "my information",
                "ನನ್ನ ಪ್ರೊಫೈಲ್", "ನನ್ನ ಖಾತೆ", "ನನ್ನ ಮಾಹಿತಿ"
            ],
            "my_bookings": [
                "show my bookings", "my rental orders", "my bookings", "view bookings",
                "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ತೋರಿಸಿ", "ನನ್ನ ಆರ್ಡರ್‌ಗಳು"
            ],
            "my_equipment": [
                "my equipment", "equipment I own", "my machines", "what do I own",
                "ನನ್ನ ಉಪಕರಣ", "ನಾನು ಹೊಂದಿರುವ ಉಪಕರಣ"
            ],
            "pending_requests": [
                "pending requests", "new requests", "booking requests", "approval requests",
                "ಬಾಕಿ ವಿನಂತಿಗಳು", "ಅನುಮೋದನೆ ವಿನಂತಿಗಳು"
            ],
            "cancel_booking": [
                "cancel my booking", "cancel booking", "cancel rental", "cancel order",
                "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ", "ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ"
            ],
            "approve_request": [
                "approve request", "accept request", "confirm booking", "approve booking",
                "ವಿನಂತಿ ಅನುಮೋದಿಸಿ", "ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ"
            ],
            "reject_request": [
                "reject request", "decline request", "deny booking", "reject booking",
                "ವಿನಂತಿ ತಿರಸ್ಕರಿಸಿ", "ಬುಕಿಂಗ್ ನಿರಾಕರಿಸಿ"
            ],
            "general": [
                "tell me about farmtech", "what is this app", "about the service",
                "how does it work", "general information", "ಸಾಮಾನ್ಯ ಮಾಹಿತಿ"
            ]
        }

        # Convert to training format
        for intent, examples in intent_examples.items():
            for example in examples:
                training_data.append({"text": example, "intent": intent})

        return training_data

    def train(self, epochs=50, batch_size=32):
        """Train the model"""
        print("Preparing training data...")
        training_data = self.prepare_training_data()

        # Prepare texts and labels
        texts = [item["text"] for item in training_data]
        labels = [item["intent"] for item in training_data]

        # Tokenize texts
        self.tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
        self.tokenizer.fit_on_texts(texts)
        sequences = self.tokenizer.texts_to_sequences(texts)
        padded_sequences = pad_sequences(sequences, maxlen=self.max_length, padding='post')

        # Encode labels
        from sklearn.preprocessing import LabelEncoder
        self.label_encoder = LabelEncoder()
        encoded_labels = self.label_encoder.fit_transform(labels)
        categorical_labels = tf.keras.utils.to_categorical(encoded_labels)

        print(f"Training with {len(texts)} samples...")
        print(f"Intent classes: {len(self.get_intent_labels())}")

        # Train the model
        history = self.model.fit(
            padded_sequences, categorical_labels,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1
        )

        # Save the model
        self.save_model()

        return history

    def predict_intent(self, text):
        """Predict intent for given text"""
        if self.model is None:
            return "general"

        # Preprocess text
        sequence = self.tokenizer.texts_to_sequences([text])
        padded_sequence = pad_sequences(sequence, maxlen=self.max_length, padding='post')

        # Predict
        prediction = self.model.predict(padded_sequence, verbose=0)
        predicted_index = np.argmax(prediction[0])
        confidence = prediction[0][predicted_index]

        # Get intent label
        if self.label_encoder:
            intent = self.label_encoder.inverse_transform([predicted_index])[0]
        else:
            intent = self.get_intent_labels()[predicted_index]

        return intent, confidence

    def save_model(self):
        """Save model and tokenizer"""
        self.model.save(f"{self.model_path}.h5")

        # Save tokenizer and label encoder
        with open(f"{self.model_path}_tokenizer.pkl", 'wb') as f:
            pickle.dump(self.tokenizer, f)

        with open(f"{self.model_path}_label_encoder.pkl", 'wb') as f:
            pickle.dump(self.label_encoder, f)

        print(f"Model saved to {self.model_path}")

    def load_model(self):
        """Load saved model and tokenizer"""
        try:
            self.model = keras.models.load_model(f"{self.model_path}.h5")

            with open(f"{self.model_path}_tokenizer.pkl", 'rb') as f:
                self.tokenizer = pickle.load(f)

            with open(f"{self.model_path}_label_encoder.pkl", 'rb') as f:
                self.label_encoder = pickle.load(f)

            print(f"Model loaded from {self.model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.build_model()