import re
from typing import Dict, List, Any
from translator import Translator
from tf_intent_classifier import TensorFlowIntentClassifier

class BilingualChatbot:
    """
    Advanced bilingual chatbot for FarmTech
    Supports English and Kannada with context-aware responses
    Can use TensorFlow for AI-powered intent classification
    """

    def __init__(self, use_ai=False):
        self.translator = Translator()
        self.intents = self._load_intents()
        self.use_ai = use_ai
        self.ai_classifier = None

        if use_ai:
            try:
                self.ai_classifier = TensorFlowIntentClassifier()
                print("AI intent classifier loaded successfully")
            except Exception as e:
                print(f"Failed to load AI classifier: {e}. Falling back to rule-based.")
                self.use_ai = False
        
    def _load_intents(self) -> Dict:
        """Load predefined intents and responses"""
        return {
            "greeting": {
                "patterns": [
                    r"\b(hi|hello|hey|namaste|namaskar)\b",
                    r"\b(ಹಲೋ|ನಮಸ್ಕಾರ|ನಮಸ್ತೆ)\b"
                ],
                "responses": {
                    "en": [
                        "Hello! Welcome to FarmTech. How can I help you today?",
                        "Hi there! I'm here to help you with equipment rental. What do you need?",
                        "Namaste! How can I assist you with farm equipment today?"
                    ],
                    "kn": [
                        "ನಮಸ್ಕಾರ! FarmTech ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
                        "ಹಲೋ! ಕೃಷಿ ಉಪಕರಣ ಬಾಡಿಗೆಗೆ ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ನಿಮಗೆ ಏನು ಬೇಕು?",
                        "ನಮಸ್ತೆ! ಇಂದು ಕೃಷಿ ಉಪಕರಣಗಳ ಬಗ್ಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
                    ]
                },
                "suggestions": {
                    "en": ["Find equipment", "How to rent", "Pricing info", "My bookings"],
                    "kn": ["ಉಪಕರಣ ಹುಡುಕಿ", "ಬಾಡಿಗೆ ಹೇಗೆ", "ಬೆಲೆ ಮಾಹಿತಿ", "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು"]
                }
            },
            
            "equipment_search": {
                "patterns": [
                    r"\b(find|search|looking for|need|want)\b.*\b(equipment|tractor|harvester|plough|tool)\b",
                    r"\b(ಹುಡುಕು|ಬೇಕು|ಅಗತ್ಯ)\b.*\b(ಉಪಕರಣ|ಟ್ರಾಕ್ಟರ್|ಯಂತ್ರ)\b"
                ],
                "responses": {
                    "en": [
                        "I can help you find equipment! What type of equipment are you looking for? We have tractors, harvesters, ploughs, and more.",
                        "Great! Let me help you search for equipment. You can browse by type, location, or price range.",
                        "Looking for farm equipment? Tell me what you need - tractor, harvester, plough, or something else?"
                    ],
                    "kn": [
                        "ನಾನು ನಿಮಗೆ ಉಪಕರಣ ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಬಹುದು! ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಉಪಕರಣ ಬೇಕು? ನಮ್ಮಲ್ಲಿ ಟ್ರಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್, ನೇಗಿಲು ಮತ್ತು ಇನ್ನಷ್ಟು ಇದೆ.",
                        "ಅದ್ಭುತ! ಉಪಕರಣ ಹುಡುಕಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನೀವು ಪ್ರಕಾರ, ಸ್ಥಳ ಅಥವಾ ಬೆಲೆ ಶ್ರೇಣಿಯ ಮೂಲಕ ಬ್ರೌಸ್ ಮಾಡಬಹುದು.",
                        "ಕೃಷಿ ಉಪಕರಣ ಹುಡುಕುತ್ತಿದ್ದೀರಾ? ನಿಮಗೆ ಏನು ಬೇಕು ಹೇಳಿ - ಟ್ರಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್, ನೇಗಿಲು ಅಥವಾ ಬೇರೆ ಏನಾದರೂ?"
                    ]
                },
                "suggestions": {
                    "en": ["Show tractors", "Show harvesters", "Equipment near me", "Price range"],
                    "kn": ["ಟ್ರಾಕ್ಟರ್ ತೋರಿಸಿ", "ಹಾರ್ವೆಸ್ಟರ್ ತೋರಿಸಿ", "ನನ್ನ ಹತ್ತಿರದ ಉಪಕರಣ", "ಬೆಲೆ ಶ್ರೇಣಿ"]
                }
            },
            
            "rental_process": {
                "patterns": [
                    r"\b(how to|how do i|process|steps)\b.*\b(rent|book|hire)\b",
                    r"\b(ಹೇಗೆ|ಪ್ರಕ್ರಿಯೆ|ಹಂತಗಳು)\b.*\b(ಬಾಡಿಗೆ|ಬುಕ್|ಬುಕಿಂಗ್)\b"
                ],
                "responses": {
                    "en": [
                        "Renting equipment is easy! 1) Search for equipment 2) Select dates 3) Send booking request 4) Owner confirms 5) Pick up equipment. Simple!",
                        "Here's how to rent: Browse equipment → Choose your dates → Request booking → Wait for owner approval → Get equipment!",
                        "The rental process: Find equipment you need → Check availability → Book it → Owner accepts → Enjoy using the equipment!"
                    ],
                    "kn": [
                        "ಉಪಕರಣ ಬಾಡಿಗೆ ಸುಲಭ! 1) ಉಪಕರಣ ಹುಡುಕಿ 2) ದಿನಾಂಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ 3) ಬುಕಿಂಗ್ ವಿನಂತಿ ಕಳುಹಿಸಿ 4) ಮಾಲೀಕರು ದೃಢೀಕರಿಸುತ್ತಾರೆ 5) ಉಪಕರಣ ತೆಗೆದುಕೊಳ್ಳಿ. ಸರಳ!",
                        "ಬಾಡಿಗೆ ಹೇಗೆ: ಉಪಕರಣ ಬ್ರೌಸ್ ಮಾಡಿ → ನಿಮ್ಮ ದಿನಾಂಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ → ಬುಕಿಂಗ್ ವಿನಂತಿಸಿ → ಮಾಲೀಕರ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯಿರಿ → ಉಪಕರಣ ಪಡೆಯಿರಿ!",
                        "ಬಾಡಿಗೆ ಪ್ರಕ್ರಿಯೆ: ನಿಮಗೆ ಬೇಕಾದ ಉಪಕರಣ ಹುಡುಕಿ → ಲಭ್ಯತೆ ಪರಿಶೀಲಿಸಿ → ಬುಕ್ ಮಾಡಿ → ಮಾಲೀಕರು ಸ್ವೀಕರಿಸುತ್ತಾರೆ → ಉಪಕರಣ ಬಳಸಿ ಆನಂದಿಸಿ!"
                    ]
                },
                "suggestions": {
                    "en": ["Start booking", "View available equipment", "Booking requirements", "Payment info"],
                    "kn": ["ಬುಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ", "ಲಭ್ಯವಿರುವ ಉಪಕರಣ ನೋಡಿ", "ಬುಕಿಂಗ್ ಅವಶ್ಯಕತೆಗಳು", "ಪಾವತಿ ಮಾಹಿತಿ"]
                }
            },
            
            "pricing": {
                "patterns": [
                    r"\b(price|cost|rate|charge|fee|payment)\b",
                    r"\b(ಬೆಲೆ|ದರ|ಶುಲ್ಕ|ಪಾವತಿ|ಖರ್ಚು)\b"
                ],
                "responses": {
                    "en": [
                        "Equipment prices vary by type and duration. Tractors typically range from ₹500-2000/day. You can see exact prices when browsing equipment.",
                        "Rental rates depend on equipment type, condition, and rental period. Browse our equipment to see specific pricing for each item.",
                        "Prices are set by equipment owners. You'll see the daily/hourly rate when you view equipment details. Most tractors are ₹500-2000/day."
                    ],
                    "kn": [
                        "ಉಪಕರಣ ಬೆಲೆಗಳು ಪ್ರಕಾರ ಮತ್ತು ಅವಧಿಯಿಂದ ಬದಲಾಗುತ್ತವೆ. ಟ್ರಾಕ್ಟರ್‌ಗಳು ಸಾಮಾನ್ಯವಾಗಿ ₹500-2000/ದಿನ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುತ್ತವೆ. ಉಪಕರಣ ಬ್ರೌಸ್ ಮಾಡುವಾಗ ನೀವು ನಿಖರ ಬೆಲೆಗಳನ್ನು ನೋಡಬಹುದು.",
                        "ಬಾಡಿಗೆ ದರಗಳು ಉಪಕರಣ ಪ್ರಕಾರ, ಸ್ಥಿತಿ ಮತ್ತು ಬಾಡಿಗೆ ಅವಧಿಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ಪ್ರತಿ ವಸ್ತುವಿಗೆ ನಿರ್ದಿಷ್ಟ ಬೆಲೆಯನ್ನು ನೋಡಲು ನಮ್ಮ ಉಪಕರಣವನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.",
                        "ಬೆಲೆಗಳನ್ನು ಉಪಕರಣ ಮಾಲೀಕರು ನಿಗದಿಪಡಿಸುತ್ತಾರೆ. ಉಪಕರಣ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿದಾಗ ನೀವು ದೈನಂದಿನ/ಗಂಟೆಯ ದರವನ್ನು ನೋಡುತ್ತೀರಿ. ಹೆಚ್ಚಿನ ಟ್ರಾಕ್ಟರ್‌ಗಳು ₹500-2000/ದಿನ."
                    ]
                },
                "suggestions": {
                    "en": ["View equipment prices", "Compare prices", "Cheapest options", "Premium equipment"],
                    "kn": ["ಉಪಕರಣ ಬೆಲೆಗಳನ್ನು ನೋಡಿ", "ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ", "ಅಗ್ಗದ ಆಯ್ಕೆಗಳು", "ಪ್ರೀಮಿಯಂ ಉಪಕರಣ"]
                }
            },
            
            "booking_status": {
                "patterns": [
                    r"\b(my booking|booking status|order status|track)\b",
                    r"\b(ನನ್ನ ಬುಕಿಂಗ್|ಬುಕಿಂಗ್ ಸ್ಥಿತಿ|ಆರ್ಡರ್ ಸ್ಥಿತಿ)\b"
                ],
                "responses": {
                    "en": [
                        "You can check your booking status in 'My Bookings' section. Would you like me to guide you there?",
                        "To view your bookings, go to your dashboard and click on 'My Bookings'. You'll see all pending, confirmed, and completed rentals.",
                        "Your booking history is available in your profile. Click on 'My Bookings' to see status of all your equipment rentals."
                    ],
                    "kn": [
                        "ನೀವು 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು' ವಿಭಾಗದಲ್ಲಿ ನಿಮ್ಮ ಬುಕಿಂಗ್ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಬಹುದು. ನಾನು ನಿಮಗೆ ಅಲ್ಲಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲೇ?",
                        "ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಲು, ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ ಮತ್ತು 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು' ಕ್ಲಿಕ್ ಮಾಡಿ. ನೀವು ಎಲ್ಲಾ ಬಾಕಿ, ದೃಢೀಕೃತ ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆಗಳನ್ನು ನೋಡುತ್ತೀರಿ.",
                        "ನಿಮ್ಮ ಬುಕಿಂಗ್ ಇತಿಹಾಸವು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದೆ. ನಿಮ್ಮ ಎಲ್ಲಾ ಉಪಕರಣ ಬಾಡಿಗೆಗಳ ಸ್ಥಿತಿಯನ್ನು ನೋಡಲು 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು' ಕ್ಲಿಕ್ ಮಾಡಿ."
                    ]
                },
                "suggestions": {
                    "en": ["Go to My Bookings", "Pending bookings", "Completed rentals", "Cancel booking"],
                    "kn": ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳಿಗೆ ಹೋಗಿ", "ಬಾಕಿ ಬುಕಿಂಗ್‌ಗಳು", "ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆಗಳು", "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ"]
                }
            },
            
            "help": {
                "patterns": [
                    r"\b(help|support|assist|problem|issue|trouble)\b",
                    r"\b(ಸಹಾಯ|ಬೆಂಬಲ|ಸಮಸ್ಯೆ|ತೊಂದರೆ)\b"
                ],
                "responses": {
                    "en": [
                        "I'm here to help! You can ask me about: Finding equipment, Rental process, Pricing, Bookings, or any other questions about FarmTech.",
                        "Need assistance? I can help you with equipment search, booking process, pricing info, account issues, or general questions.",
                        "How can I assist you? I can help with: Equipment rental, Booking management, Pricing queries, Technical support, or general information."
                    ],
                    "kn": [
                        "ನಾನು ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ! ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು: ಉಪಕರಣ ಹುಡುಕುವುದು, ಬಾಡಿಗೆ ಪ್ರಕ್ರಿಯೆ, ಬೆಲೆ, ಬುಕಿಂಗ್‌ಗಳು, ಅಥವಾ FarmTech ಬಗ್ಗೆ ಯಾವುದೇ ಇತರ ಪ್ರಶ್ನೆಗಳು.",
                        "ಸಹಾಯ ಬೇಕೇ? ನಾನು ನಿಮಗೆ ಉಪಕರಣ ಹುಡುಕಾಟ, ಬುಕಿಂಗ್ ಪ್ರಕ್ರಿಯೆ, ಬೆಲೆ ಮಾಹಿತಿ, ಖಾತೆ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳೊಂದಿಗೆ ಸಹಾಯ ಮಾಡಬಹುದು.",
                        "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು: ಉಪಕರಣ ಬಾಡಿಗೆ, ಬುಕಿಂಗ್ ನಿರ್ವಹಣೆ, ಬೆಲೆ ಪ್ರಶ್ನೆಗಳು, ತಾಂತ್ರಿಕ ಬೆಂಬಲ, ಅಥವಾ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ."
                    ]
                },
                "suggestions": {
                    "en": ["Equipment help", "Booking help", "Account issues", "Contact support"],
                    "kn": ["ಉಪಕರಣ ಸಹಾಯ", "ಬುಕಿಂಗ್ ಸಹಾಯ", "ಖಾತೆ ಸಮಸ್ಯೆಗಳು", "ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ"]
                }
            },
            
            "equipment_types": {
                "patterns": [
                    r"\b(tractor|harvester|plough|plow|cultivator|seeder|sprayer|thresher)\b",
                    r"\b(ಟ್ರಾಕ್ಟರ್|ಹಾರ್ವೆಸ್ಟರ್|ನೇಗಿಲು|ಕಲ್ಟಿವೇಟರ್|ಬಿತ್ತನೆ ಯಂತ್ರ|ಸಿಂಪಡಣೆ ಯಂತ್ರ|ಥ್ರೆಶರ್)\b"
                ],
                "responses": {
                    "en": [
                        "We have various equipment types: Tractors (for plowing, transport), Harvesters (crop harvesting), Ploughs (soil preparation), Cultivators, Seeders, Sprayers, and more!",
                        "Available equipment includes: Tractors, Combine Harvesters, Rotavators, Ploughs, Cultivators, Seed Drills, Sprayers, Threshers, and other farm machinery.",
                        "Our platform offers: Tractors (various HP), Harvesters, Tillers, Ploughs, Cultivators, Planters, Sprayers, and specialized equipment. What are you looking for?"
                    ],
                    "kn": [
                        "ನಮ್ಮಲ್ಲಿ ವಿವಿಧ ಉಪಕರಣ ಪ್ರಕಾರಗಳಿವೆ: ಟ್ರಾಕ್ಟರ್‌ಗಳು (ಉಳುಮೆ, ಸಾಗಣೆಗಾಗಿ), ಹಾರ್ವೆಸ್ಟರ್‌ಗಳು (ಬೆಳೆ ಕೊಯ್ಲು), ನೇಗಿಲುಗಳು (ಮಣ್ಣು ತಯಾರಿಕೆ), ಕಲ್ಟಿವೇಟರ್‌ಗಳು, ಬಿತ್ತನೆ ಯಂತ್ರಗಳು, ಸಿಂಪಡಣೆ ಯಂತ್ರಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು!",
                        "ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳು: ಟ್ರಾಕ್ಟರ್‌ಗಳು, ಕಂಬೈನ್ ಹಾರ್ವೆಸ್ಟರ್‌ಗಳು, ರೋಟಾವೇಟರ್‌ಗಳು, ನೇಗಿಲುಗಳು, ಕಲ್ಟಿವೇಟರ್‌ಗಳು, ಬೀಜ ಡ್ರಿಲ್‌ಗಳು, ಸಿಂಪಡಣೆ ಯಂತ್ರಗಳು, ಥ್ರೆಶರ್‌ಗಳು ಮತ್ತು ಇತರ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳು.",
                        "ನಮ್ಮ ವೇದಿಕೆ ನೀಡುತ್ತದೆ: ಟ್ರಾಕ್ಟರ್‌ಗಳು (ವಿವಿಧ HP), ಹಾರ್ವೆಸ್ಟರ್‌ಗಳು, ಟಿಲ್ಲರ್‌ಗಳು, ನೇಗಿಲುಗಳು, ಕಲ್ಟಿವೇಟರ್‌ಗಳು, ಪ್ಲಾಂಟರ್‌ಗಳು, ಸಿಂಪಡಣೆ ಯಂತ್ರಗಳು ಮತ್ತು ವಿಶೇಷ ಉಪಕರಣಗಳು. ನೀವು ಏನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?"
                    ]
                },
                "suggestions": {
                    "en": ["Show all tractors", "Show harvesters", "Show ploughs", "All equipment"],
                    "kn": ["ಎಲ್ಲಾ ಟ್ರಾಕ್ಟರ್‌ಗಳನ್ನು ತೋರಿಸಿ", "ಹಾರ್ವೆಸ್ಟರ್‌ಗಳನ್ನು ತೋರಿಸಿ", "ನೇಗಿಲುಗಳನ್ನು ತೋರಿಸಿ", "ಎಲ್ಲಾ ಉಪಕರಣಗಳು"]
                }
            },
            
            "thanks": {
                "patterns": [
                    r"\b(thank|thanks|appreciate|grateful)\b",
                    r"\b(ಧನ್ಯವಾದ|ಧನ್ಯವಾದಗಳು)\b"
                ],
                "responses": {
                    "en": [
                        "You're welcome! Happy to help. Feel free to ask if you need anything else!",
                        "My pleasure! Let me know if you have any other questions.",
                        "Glad I could help! Don't hesitate to reach out if you need more assistance."
                    ],
                    "kn": [
                        "ನಿಮಗೆ ಸ್ವಾಗತ! ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷವಾಗಿದೆ. ನಿಮಗೆ ಬೇರೆ ಏನಾದರೂ ಬೇಕಾದರೆ ಕೇಳಲು ಮುಕ್ತವಾಗಿರಿ!",
                        "ನನ್ನ ಸಂತೋಷ! ನಿಮಗೆ ಬೇರೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ ನನಗೆ ತಿಳಿಸಿ.",
                        "ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷವಾಗಿದೆ! ನಿಮಗೆ ಹೆಚ್ಚಿನ ಸಹಾಯ ಬೇಕಾದರೆ ಸಂಪರ್ಕಿಸಲು ಹಿಂಜರಿಯಬೇಡಿ."
                    ]
                },
                "suggestions": {
                    "en": ["Find equipment", "View bookings", "Contact support", "Browse equipment"],
                    "kn": ["ಉಪಕರಣ ಹುಡುಕಿ", "ಬುಕಿಂಗ್‌ಗಳನ್ನು ನೋಡಿ", "ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ", "ಉಪಕರಣ ಬ್ರೌಸ್ ಮಾಡಿ"]
                }
            }
        }
    
    def get_response(self, message: str, language: str = "en", context: Dict = None) -> Dict[str, Any]:
        """
        Get chatbot response for user message
        
        Args:
            message: User's message
            language: Language code ('en' or 'kn')
            context: Optional context (user info, location, etc.)
        
        Returns:
            Dictionary with answer, intent, and suggestions
        """
        # Detect intent
        intent = self._detect_intent(message)
        
        # Get response for detected intent
        if intent in self.intents:
            intent_data = self.intents[intent]
            import random
            response = random.choice(intent_data["responses"][language])
            suggestions = intent_data["suggestions"][language]
        else:
            # Default response
            response = self._get_default_response(language)
            suggestions = self._get_default_suggestions(language)
        
        return {
            "answer": response,
            "intent": intent,
            "suggestions": suggestions
        }
    
    def _detect_intent(self, message: str) -> str:
        """Detect user intent from message using AI or rule-based approach"""
        # Try AI classification first if enabled
        if self.use_ai and self.ai_classifier:
            try:
                ai_intent, confidence = self.ai_classifier.predict_intent(message)
                # Only use AI result if confidence is high enough (>0.7)
                if confidence > 0.7:
                    return ai_intent
            except Exception as e:
                print(f"AI classification failed: {e}. Using rule-based fallback.")

        # Fall back to rule-based detection
        message_lower = message.lower()

        # Check each intent's patterns
        for intent_name, intent_data in self.intents.items():
            for pattern in intent_data["patterns"]:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    return intent_name

        return "general"
    
    def _get_default_response(self, language: str) -> str:
        """Get default response when no intent is matched"""
        responses = {
            "en": "I'm here to help you with FarmTech equipment rental! You can ask me about finding equipment, rental process, pricing, bookings, or any other questions.",
            "kn": "ನಾನು FarmTech ಉಪಕರಣ ಬಾಡಿಗೆಯೊಂದಿಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ! ನೀವು ನನ್ನನ್ನು ಉಪಕರಣ ಹುಡುಕುವುದು, ಬಾಡಿಗೆ ಪ್ರಕ್ರಿಯೆ, ಬೆಲೆ, ಬುಕಿಂಗ್‌ಗಳು ಅಥವಾ ಯಾವುದೇ ಇತರ ಪ್ರಶ್ನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
        }
        return responses.get(language, responses["en"])
    
    def _get_default_suggestions(self, language: str) -> List[str]:
        """Get default suggestions"""
        suggestions = {
            "en": ["Find equipment", "How to rent", "Pricing info", "My bookings", "Help"],
            "kn": ["ಉಪಕರಣ ಹುಡುಕಿ", "ಬಾಡಿಗೆ ಹೇಗೆ", "ಬೆಲೆ ಮಾಹಿತಿ", "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಸಹಾಯ"]
        }
        return suggestions.get(language, suggestions["en"])