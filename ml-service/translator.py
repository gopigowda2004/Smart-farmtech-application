import re
from typing import Dict

class Translator:
    """
    Bilingual translator for English and Kannada
    Uses rule-based translation with common farming terms
    """
    
    def __init__(self):
        self.en_to_kn = self._load_en_to_kn_dict()
        self.kn_to_en = self._load_kn_to_en_dict()
    
    def _load_en_to_kn_dict(self) -> Dict[str, str]:
        """Load English to Kannada translation dictionary"""
        return {
            # Greetings
            "hello": "ಹಲೋ",
            "hi": "ಹಾಯ್",
            "namaste": "ನಮಸ್ಕಾರ",
            "good morning": "ಶುಭೋದಯ",
            "good evening": "ಶುಭ ಸಂಜೆ",
            "thank you": "ಧನ್ಯವಾದ",
            "thanks": "ಧನ್ಯವಾದಗಳು",
            "welcome": "ಸ್ವಾಗತ",
            "bye": "ವಿದಾಯ",
            "goodbye": "ವಿದಾಯ",
            
            # Equipment
            "equipment": "ಉಪಕರಣ",
            "tractor": "ಟ್ರಾಕ್ಟರ್",
            "harvester": "ಹಾರ್ವೆಸ್ಟರ್",
            "plough": "ನೇಗಿಲು",
            "plow": "ನೇಗಿಲು",
            "cultivator": "ಕಲ್ಟಿವೇಟರ್",
            "seeder": "ಬಿತ್ತನೆ ಯಂತ್ರ",
            "sprayer": "ಸಿಂಪಡಣೆ ಯಂತ್ರ",
            "thresher": "ಥ್ರೆಶರ್",
            "rotavator": "ರೋಟಾವೇಟರ್",
            "machine": "ಯಂತ್ರ",
            "tool": "ಸಾಧನ",
            
            # Rental terms
            "rent": "ಬಾಡಿಗೆ",
            "rental": "ಬಾಡಿಗೆ",
            "hire": "ಬಾಡಿಗೆ",
            "book": "ಬುಕ್",
            "booking": "ಬುಕಿಂಗ್",
            "reserve": "ಕಾಯ್ದಿರಿಸಿ",
            "reservation": "ಕಾಯ್ದಿರಿಸುವಿಕೆ",
            "available": "ಲಭ್ಯವಿದೆ",
            "availability": "ಲಭ್ಯತೆ",
            
            # Actions
            "search": "ಹುಡುಕು",
            "find": "ಹುಡುಕು",
            "show": "ತೋರಿಸಿ",
            "view": "ನೋಡಿ",
            "browse": "ಬ್ರೌಸ್ ಮಾಡಿ",
            "select": "ಆಯ್ಕೆಮಾಡಿ",
            "choose": "ಆಯ್ಕೆಮಾಡಿ",
            "cancel": "ರದ್ದುಮಾಡಿ",
            "confirm": "ದೃಢೀಕರಿಸಿ",
            "accept": "ಸ್ವೀಕರಿಸಿ",
            "reject": "ತಿರಸ್ಕರಿಸಿ",
            
            # Status
            "pending": "ಬಾಕಿ",
            "confirmed": "ದೃಢೀಕೃತ",
            "completed": "ಪೂರ್ಣಗೊಂಡ",
            "cancelled": "ರದ್ದುಗೊಂಡ",
            "active": "ಸಕ್ರಿಯ",
            "inactive": "ನಿಷ್ಕ್ರಿಯ",
            
            # Pricing
            "price": "ಬೆಲೆ",
            "cost": "ಖರ್ಚು",
            "rate": "ದರ",
            "fee": "ಶುಲ್ಕ",
            "charge": "ಶುಲ್ಕ",
            "payment": "ಪಾವತಿ",
            "rupees": "ರೂಪಾಯಿಗಳು",
            "day": "ದಿನ",
            "hour": "ಗಂಟೆ",
            "week": "ವಾರ",
            "month": "ತಿಂಗಳು",
            
            # Location
            "location": "ಸ್ಥಳ",
            "address": "ವಿಳಾಸ",
            "near": "ಹತ್ತಿರ",
            "nearby": "ಹತ್ತಿರದ",
            "distance": "ಅಂತರ",
            "area": "ಪ್ರದೇಶ",
            "village": "ಗ್ರಾಮ",
            "city": "ನಗರ",
            
            # User
            "farmer": "ರೈತ",
            "owner": "ಮಾಲೀಕ",
            "renter": "ಬಾಡಿಗೆದಾರ",
            "user": "ಬಳಕೆದಾರ",
            "account": "ಖಾತೆ",
            "profile": "ಪ್ರೊಫೈಲ್",
            "name": "ಹೆಸರು",
            "phone": "ಫೋನ್",
            "email": "ಇಮೇಲ್",
            
            # Questions
            "what": "ಏನು",
            "when": "ಯಾವಾಗ",
            "where": "ಎಲ್ಲಿ",
            "who": "ಯಾರು",
            "why": "ಯಾಕೆ",
            "how": "ಹೇಗೆ",
            "which": "ಯಾವ",
            
            # Common words
            "yes": "ಹೌದು",
            "no": "ಇಲ್ಲ",
            "ok": "ಸರಿ",
            "okay": "ಸರಿ",
            "please": "ದಯವಿಟ್ಟು",
            "help": "ಸಹಾಯ",
            "support": "ಬೆಂಬಲ",
            "problem": "ಸಮಸ್ಯೆ",
            "issue": "ಸಮಸ್ಯೆ",
            "question": "ಪ್ರಶ್ನೆ",
            "answer": "ಉತ್ತರ",
            "information": "ಮಾಹಿತಿ",
            "details": "ವಿವರಗಳು",
            
            # Farm related
            "farm": "ಕೃಷಿ",
            "farming": "ಕೃಷಿ",
            "agriculture": "ಕೃಷಿ",
            "crop": "ಬೆಳೆ",
            "field": "ಹೊಲ",
            "land": "ಭೂಮಿ",
            "soil": "ಮಣ್ಣು",
            "seed": "ಬೀಜ",
            "fertilizer": "ಗೊಬ್ಬರ",
            "harvest": "ಕೊಯ್ಲು",
            "season": "ಋತು",
            
            # Time
            "today": "ಇಂದು",
            "tomorrow": "ನಾಳೆ",
            "yesterday": "ನಿನ್ನೆ",
            "now": "ಈಗ",
            "later": "ನಂತರ",
            "soon": "ಶೀಘ್ರದಲ್ಲಿ",
            "date": "ದಿನಾಂಕ",
            "time": "ಸಮಯ",
            
            # Actions/Process
            "start": "ಪ್ರಾರಂಭಿಸಿ",
            "stop": "ನಿಲ್ಲಿಸಿ",
            "continue": "ಮುಂದುವರಿಸಿ",
            "process": "ಪ್ರಕ್ರಿಯೆ",
            "step": "ಹಂತ",
            "steps": "ಹಂತಗಳು",
            "need": "ಅಗತ್ಯ",
            "want": "ಬೇಕು",
            "require": "ಅಗತ್ಯವಿದೆ",
            "looking for": "ಹುಡುಕುತ್ತಿದ್ದೇನೆ",
        }
    
    def _load_kn_to_en_dict(self) -> Dict[str, str]:
        """Load Kannada to English translation dictionary"""
        # Reverse the English to Kannada dictionary
        return {v: k for k, v in self.en_to_kn.items()}
    
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate text between English and Kannada
        
        Args:
            text: Text to translate
            source_lang: Source language code ('en' or 'kn')
            target_lang: Target language code ('en' or 'kn')
        
        Returns:
            Translated text
        """
        if source_lang == target_lang:
            return text
        
        if source_lang == "en" and target_lang == "kn":
            return self._translate_en_to_kn(text)
        elif source_lang == "kn" and target_lang == "en":
            return self._translate_kn_to_en(text)
        else:
            return text
    
    def _translate_en_to_kn(self, text: str) -> str:
        """Translate English to Kannada"""
        translated = text.lower()
        
        # Sort by length (longest first) to handle phrases before words
        sorted_terms = sorted(self.en_to_kn.items(), key=lambda x: len(x[0]), reverse=True)
        
        for en_term, kn_term in sorted_terms:
            # Use word boundaries for better matching
            pattern = r'\b' + re.escape(en_term) + r'\b'
            translated = re.sub(pattern, kn_term, translated, flags=re.IGNORECASE)
        
        return translated
    
    def _translate_kn_to_en(self, text: str) -> str:
        """Translate Kannada to English"""
        translated = text
        
        # Sort by length (longest first)
        sorted_terms = sorted(self.kn_to_en.items(), key=lambda x: len(x[0]), reverse=True)
        
        for kn_term, en_term in sorted_terms:
            translated = translated.replace(kn_term, en_term)
        
        return translated
    
    def detect_language(self, text: str) -> str:
        """
        Detect if text is in English or Kannada
        
        Args:
            text: Text to detect
        
        Returns:
            Language code ('en' or 'kn')
        """
        # Check for Kannada Unicode range (0C80-0CFF)
        kannada_pattern = r'[\u0C80-\u0CFF]'
        
        if re.search(kannada_pattern, text):
            return "kn"
        else:
            return "en"