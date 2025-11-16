import re
from typing import Dict, List, Any
from chatbot import BilingualChatbot
import requests

class PersonalizedChatbot(BilingualChatbot):
    """
    Enhanced chatbot with personalized responses based on user data
    """
    
    def __init__(self, use_ai=False):
        super().__init__(use_ai)
        self.personalized_intents = self._load_personalized_intents()
        self.backend_api_base = "http://localhost:8090"
    
    def _load_personalized_intents(self) -> Dict:
        """Load personalized intent patterns"""
        return {
            "my_profile": {
                "patterns": [
                    r"\b(my profile|my account|my details|my info|who am i)\b",
                    r"\b(ನನ್ನ ಪ್ರೊಫೈಲ್|ನನ್ನ ಖಾತೆ|ನನ್ನ ವಿವರಗಳು|ನನ್ನ ಮಾಹಿತಿ)\b"
                ]
            },
            "my_bookings": {
                "patterns": [
                    r"\b(my booking|my order|my rental|show.*booking|view.*booking)\b",
                    r"\b(ನನ್ನ ಬುಕಿಂಗ್|ನನ್ನ ಆರ್ಡರ್|ನನ್ನ ಬಾಡಿಗೆ|ಬುಕಿಂಗ್.*ತೋರಿಸಿ)\b"
                ]
            },
            "my_equipment": {
                "patterns": [
                    r"\b(my equipment|my machine|equipment i own|what.*i own)\b",
                    r"\b(ನನ್ನ ಉಪಕರಣ|ನನ್ನ ಯಂತ್ರ|ನಾನು ಹೊಂದಿರುವ ಉಪಕರಣ)\b"
                ]
            },
            "pending_requests": {
                "patterns": [
                    r"\b(pending request|new request|booking request|approval.*request)\b",
                    r"\b(ಬಾಕಿ ವಿನಂತಿ|ಹೊಸ ವಿನಂತಿ|ಬುಕಿಂಗ್ ವಿನಂತಿ|ಅನುಮೋದನೆ.*ವಿನಂತಿ)\b"
                ]
            },
            "cancel_booking": {
                "patterns": [
                    r"\b(cancel.*booking|cancel.*order|cancel.*rental)\b",
                    r"\b(ಬುಕಿಂಗ್.*ರದ್ದು|ಆರ್ಡರ್.*ರದ್ದು|ಬಾಡಿಗೆ.*ರದ್ದು)\b"
                ]
            },
            "approve_request": {
                "patterns": [
                    r"\b(approve.*request|accept.*request|confirm.*booking)\b",
                    r"\b(ವಿನಂತಿ.*ಅನುಮೋದಿಸಿ|ವಿನಂತಿ.*ಸ್ವೀಕರಿಸಿ|ಬುಕಿಂಗ್.*ದೃಢೀಕರಿಸಿ)\b"
                ]
            },
            "reject_request": {
                "patterns": [
                    r"\b(reject.*request|decline.*request|deny.*request)\b",
                    r"\b(ವಿನಂತಿ.*ತಿರಸ್ಕರಿಸಿ|ವಿನಂತಿ.*ನಿರಾಕರಿಸಿ)\b"
                ]
            }
        }
    
    def get_response(self, message: str, language: str = "en", context: Dict = None, user_data: Dict = None) -> Dict[str, Any]:
        """
        Get personalized chatbot response
        
        Args:
            message: User's message
            language: Language code ('en' or 'kn')
            context: Optional context
            user_data: User's personal data (profile, bookings, equipment, etc.)
        
        Returns:
            Dictionary with response, intent, and suggestions
        """
        # Check for confirmation actions first
        confirmation_result = self._check_confirmation_action(message, language, user_data)
        if confirmation_result:
            return confirmation_result
        
        # Check for personalized intents
        personalized_intent = self._detect_personalized_intent(message)
        
        if personalized_intent and user_data:
            return self._handle_personalized_intent(personalized_intent, language, user_data, message)
        
        # Fall back to base chatbot for general queries
        base_response = super().get_response(message, language, context)
        return {
            "response": base_response["answer"],
            "detected_intent": base_response["intent"],
            "language": language,
            "suggestions": base_response["suggestions"]
        }
    
    def _detect_personalized_intent(self, message: str) -> str:
        """Detect personalized intent from message"""
        message_lower = message.lower()
        
        for intent_name, intent_data in self.personalized_intents.items():
            for pattern in intent_data["patterns"]:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    return intent_name
        
        return None
    
    def _check_confirmation_action(self, message: str, language: str, user_data: Dict) -> Dict[str, Any]:
        """Check if message is a confirmation action and execute it"""
        if not user_data:
            return None
        
        message_lower = message.lower()
        
        # Check for cancel booking confirmation
        cancel_match = re.search(r'confirm.*cancel.*#?(\d+)', message_lower)
        if cancel_match:
            booking_id = cancel_match.group(1)
            return self._execute_cancel_booking(booking_id, language, user_data)
        
        # Check for approve request confirmation
        approve_match = re.search(r'confirm.*approve.*#?(\d+)', message_lower)
        if approve_match:
            candidate_id = approve_match.group(1)
            return self._execute_approve_request(candidate_id, language, user_data)
        
        # Check for reject request confirmation
        reject_match = re.search(r'confirm.*reject.*#?(\d+)', message_lower)
        if reject_match:
            candidate_id = reject_match.group(1)
            return self._execute_reject_request(candidate_id, language, user_data)
        
        # Check Kannada confirmations
        if 'ದೃಢೀಕರಿಸಿ' in message or 'ದೃಢೀಕರಣ' in message:
            # Cancel booking in Kannada
            if 'ರದ್ದು' in message:
                cancel_match = re.search(r'#?(\d+)', message)
                if cancel_match:
                    booking_id = cancel_match.group(1)
                    return self._execute_cancel_booking(booking_id, language, user_data)
            
            # Approve in Kannada
            if 'ಅನುಮೋದನೆ' in message or 'ಅನುಮೋದಿಸಿ' in message:
                approve_match = re.search(r'#?(\d+)', message)
                if approve_match:
                    candidate_id = approve_match.group(1)
                    return self._execute_approve_request(candidate_id, language, user_data)
            
            # Reject in Kannada
            if 'ತಿರಸ್ಕಾರ' in message or 'ತಿರಸ್ಕರಿಸಿ' in message:
                reject_match = re.search(r'#?(\d+)', message)
                if reject_match:
                    candidate_id = reject_match.group(1)
                    return self._execute_reject_request(candidate_id, language, user_data)
        
        return None
    
    def _execute_cancel_booking(self, booking_id: str, language: str, user_data: Dict) -> Dict[str, Any]:
        """Execute cancel booking action"""
        try:
            user_id = user_data.get('id')
            response = requests.post(
                f"{self.backend_api_base}/api/chatbot-data/action",
                json={
                    "action": "cancel_booking",
                    "userId": user_id,
                    "bookingId": booking_id
                },
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if language == "en":
                    return {
                        "response": f"✅ Booking #{booking_id} has been cancelled successfully!\n\nYou can make a new booking anytime.",
                        "detected_intent": "cancel_booking_confirmed",
                        "language": language,
                        "suggestions": ["My bookings", "Find equipment", "Help"]
                    }
                else:
                    return {
                        "response": f"✅ ಬುಕಿಂಗ್ #{booking_id} ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ!\n\nನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಹೊಸ ಬುಕಿಂಗ್ ಮಾಡಬಹುದು.",
                        "detected_intent": "cancel_booking_confirmed",
                        "language": language,
                        "suggestions": ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಉಪಕರಣ ಹುಡುಕಿ", "ಸಹಾಯ"]
                    }
            else:
                error_msg = response.json().get('error', 'Unknown error')
                if language == "en":
                    return {
                        "response": f"❌ Failed to cancel booking: {error_msg}\n\nPlease try again or contact support.",
                        "detected_intent": "cancel_booking_failed",
                        "language": language,
                        "suggestions": ["My bookings", "Help"]
                    }
                else:
                    return {
                        "response": f"❌ ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಲು ವಿಫಲವಾಗಿದೆ: {error_msg}\n\nದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                        "detected_intent": "cancel_booking_failed",
                        "language": language,
                        "suggestions": ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಸಹಾಯ"]
                    }
        except Exception as e:
            if language == "en":
                return {
                    "response": f"❌ Error cancelling booking: {str(e)}\n\nPlease try again later.",
                    "detected_intent": "cancel_booking_error",
                    "language": language,
                    "suggestions": ["My bookings", "Help"]
                }
            else:
                return {
                    "response": f"❌ ಬುಕಿಂಗ್ ರದ್ದುಮಾಡುವಲ್ಲಿ ದೋಷ: {str(e)}\n\nದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
                    "detected_intent": "cancel_booking_error",
                    "language": language,
                    "suggestions": ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಸಹಾಯ"]
                }
    
    def _execute_approve_request(self, candidate_id: str, language: str, user_data: Dict) -> Dict[str, Any]:
        """Execute approve request action"""
        try:
            user_id = user_data.get('id')
            response = requests.post(
                f"{self.backend_api_base}/api/chatbot-data/action",
                json={
                    "action": "approve_request",
                    "userId": user_id,
                    "candidateId": candidate_id
                },
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if language == "en":
                    return {
                        "response": f"✅ Request #{candidate_id} has been approved successfully!\n\nThe booking is now confirmed. The renter will be notified.",
                        "detected_intent": "approve_request_confirmed",
                        "language": language,
                        "suggestions": ["Pending requests", "My equipment", "Help"]
                    }
                else:
                    return {
                        "response": f"✅ ವಿನಂತಿ #{candidate_id} ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!\n\nಬುಕಿಂಗ್ ಈಗ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಬಾಡಿಗೆದಾರರಿಗೆ ತಿಳಿಸಲಾಗುವುದು.",
                        "detected_intent": "approve_request_confirmed",
                        "language": language,
                        "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ನನ್ನ ಉಪಕರಣ", "ಸಹಾಯ"]
                    }
            else:
                error_msg = response.json().get('error', 'Unknown error')
                if language == "en":
                    return {
                        "response": f"❌ Failed to approve request: {error_msg}\n\nPlease try again or contact support.",
                        "detected_intent": "approve_request_failed",
                        "language": language,
                        "suggestions": ["Pending requests", "Help"]
                    }
                else:
                    return {
                        "response": f"❌ ವಿನಂತಿ ಅನುಮೋದಿಸಲು ವಿಫಲವಾಗಿದೆ: {error_msg}\n\nದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                        "detected_intent": "approve_request_failed",
                        "language": language,
                        "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ಸಹಾಯ"]
                    }
        except Exception as e:
            if language == "en":
                return {
                    "response": f"❌ Error approving request: {str(e)}\n\nPlease try again later.",
                    "detected_intent": "approve_request_error",
                    "language": language,
                    "suggestions": ["Pending requests", "Help"]
                }
            else:
                return {
                    "response": f"❌ ವಿನಂತಿ ಅನುಮೋದಿಸುವಲ್ಲಿ ದೋಷ: {str(e)}\n\nದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
                    "detected_intent": "approve_request_error",
                    "language": language,
                    "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ಸಹಾಯ"]
                }
    
    def _execute_reject_request(self, candidate_id: str, language: str, user_data: Dict) -> Dict[str, Any]:
        """Execute reject request action"""
        try:
            user_id = user_data.get('id')
            response = requests.post(
                f"{self.backend_api_base}/api/chatbot-data/action",
                json={
                    "action": "reject_request",
                    "userId": user_id,
                    "candidateId": candidate_id
                },
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if language == "en":
                    return {
                        "response": f"✅ Request #{candidate_id} has been rejected.\n\nThe renter will be notified that their request was declined.",
                        "detected_intent": "reject_request_confirmed",
                        "language": language,
                        "suggestions": ["Pending requests", "My equipment", "Help"]
                    }
                else:
                    return {
                        "response": f"✅ ವಿನಂತಿ #{candidate_id} ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.\n\nಅವರ ವಿನಂತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ ಎಂದು ಬಾಡಿಗೆದಾರರಿಗೆ ತಿಳಿಸಲಾಗುವುದು.",
                        "detected_intent": "reject_request_confirmed",
                        "language": language,
                        "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ನನ್ನ ಉಪಕರಣ", "ಸಹಾಯ"]
                    }
            else:
                error_msg = response.json().get('error', 'Unknown error')
                if language == "en":
                    return {
                        "response": f"❌ Failed to reject request: {error_msg}\n\nPlease try again or contact support.",
                        "detected_intent": "reject_request_failed",
                        "language": language,
                        "suggestions": ["Pending requests", "Help"]
                    }
                else:
                    return {
                        "response": f"❌ ವಿನಂತಿ ತಿರಸ್ಕರಿಸಲು ವಿಫಲವಾಗಿದೆ: {error_msg}\n\nದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                        "detected_intent": "reject_request_failed",
                        "language": language,
                        "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ಸಹಾಯ"]
                    }
        except Exception as e:
            if language == "en":
                return {
                    "response": f"❌ Error rejecting request: {str(e)}\n\nPlease try again later.",
                    "detected_intent": "reject_request_error",
                    "language": language,
                    "suggestions": ["Pending requests", "Help"]
                }
            else:
                return {
                    "response": f"❌ ವಿನಂತಿ ತಿರಸ್ಕರಿಸುವಲ್ಲಿ ದೋಷ: {str(e)}\n\nದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
                    "detected_intent": "reject_request_error",
                    "language": language,
                    "suggestions": ["ಬಾಕಿ ವಿನಂತಿಗಳು", "ಸಹಾಯ"]
                }
    
    def _handle_personalized_intent(self, intent: str, language: str, user_data: Dict, message: str) -> Dict[str, Any]:
        """Handle personalized intents with user data"""
        
        if intent == "my_profile":
            return self._get_profile_response(language, user_data)
        
        elif intent == "my_bookings":
            return self._get_bookings_response(language, user_data)
        
        elif intent == "my_equipment":
            return self._get_equipment_response(language, user_data)
        
        elif intent == "pending_requests":
            return self._get_requests_response(language, user_data)
        
        elif intent == "cancel_booking":
            return self._get_cancel_booking_response(language, user_data, message)
        
        elif intent == "approve_request":
            return self._get_approve_request_response(language, user_data, message)
        
        elif intent == "reject_request":
            return self._get_reject_request_response(language, user_data, message)
        
        return self._get_default_personalized_response(language)
    
    def _get_profile_response(self, language: str, user_data: Dict) -> Dict[str, Any]:
        """Generate profile information response"""
        name = user_data.get("name", "User")
        role = user_data.get("role", "RENTER")
        district = user_data.get("district", "")
        farm_size = user_data.get("farmSize", "")
        crop_type = user_data.get("cropType", "")
        
        if language == "en":
            response = f"👤 **Your Profile**\n\n"
            response += f"Name: {name}\n"
            response += f"Role: {role}\n"
            if district:
                response += f"Location: {district}\n"
            if farm_size:
                response += f"Farm Size: {farm_size}\n"
            if crop_type:
                response += f"Crop Type: {crop_type}\n"
            
            suggestions = ["My bookings", "My equipment", "Update profile", "Help"]
        else:
            response = f"👤 **ನಿಮ್ಮ ಪ್ರೊಫೈಲ್**\n\n"
            response += f"ಹೆಸರು: {name}\n"
            response += f"ಪಾತ್ರ: {role}\n"
            if district:
                response += f"ಸ್ಥಳ: {district}\n"
            if farm_size:
                response += f"ಜಮೀನು ಗಾತ್ರ: {farm_size}\n"
            if crop_type:
                response += f"ಬೆಳೆ ಪ್ರಕಾರ: {crop_type}\n"
            
            suggestions = ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ನನ್ನ ಉಪಕರಣ", "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "my_profile",
            "language": language,
            "suggestions": suggestions,
            "data": user_data
        }
    
    def _get_bookings_response(self, language: str, user_data: Dict) -> Dict[str, Any]:
        """Generate bookings information response"""
        bookings = user_data.get("bookings", [])
        
        if language == "en":
            if not bookings:
                response = "📋 You don't have any bookings yet.\n\nWould you like to browse available equipment?"
                suggestions = ["Find equipment", "View all equipment", "Help"]
            else:
                response = f"📋 **Your Bookings** ({len(bookings)} total)\n\n"
                for i, booking in enumerate(bookings[:5], 1):  # Show first 5
                    booking_id = booking.get("id", "")
                    equipment_name = booking.get("equipment", {}).get("name", "Equipment")
                    status = booking.get("status", "PENDING")
                    start_date = booking.get("startDate", "")
                    price = booking.get("totalPrice", 0)
                    
                    response += f"{i}. {equipment_name}\n"
                    response += f"   Status: {status}\n"
                    response += f"   Date: {start_date}\n"
                    response += f"   Price: ₹{price}\n"
                    response += f"   ID: {booking_id}\n\n"
                
                if len(bookings) > 5:
                    response += f"...and {len(bookings) - 5} more bookings\n"
                
                suggestions = ["Cancel booking", "View details", "New booking", "Help"]
        else:
            if not bookings:
                response = "📋 ನಿಮಗೆ ಇನ್ನೂ ಯಾವುದೇ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ.\n\nನೀವು ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಲು ಬಯಸುವಿರಾ?"
                suggestions = ["ಉಪಕರಣ ಹುಡುಕಿ", "ಎಲ್ಲಾ ಉಪಕರಣಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
            else:
                response = f"📋 **ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳು** ({len(bookings)} ಒಟ್ಟು)\n\n"
                for i, booking in enumerate(bookings[:5], 1):
                    booking_id = booking.get("id", "")
                    equipment_name = booking.get("equipment", {}).get("name", "ಉಪಕರಣ")
                    status = booking.get("status", "ಬಾಕಿ")
                    start_date = booking.get("startDate", "")
                    price = booking.get("totalPrice", 0)
                    
                    response += f"{i}. {equipment_name}\n"
                    response += f"   ಸ್ಥಿತಿ: {status}\n"
                    response += f"   ದಿನಾಂಕ: {start_date}\n"
                    response += f"   ಬೆಲೆ: ₹{price}\n"
                    response += f"   ID: {booking_id}\n\n"
                
                if len(bookings) > 5:
                    response += f"...ಮತ್ತು {len(bookings) - 5} ಹೆಚ್ಚಿನ ಬುಕಿಂಗ್‌ಗಳು\n"
                
                suggestions = ["ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ", "ವಿವರಗಳನ್ನು ನೋಡಿ", "ಹೊಸ ಬುಕಿಂಗ್", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "my_bookings",
            "language": language,
            "suggestions": suggestions,
            "data": {"bookings": bookings}
        }
    
    def _get_equipment_response(self, language: str, user_data: Dict) -> Dict[str, Any]:
        """Generate equipment information response"""
        equipment_list = user_data.get("equipment", [])
        role = user_data.get("role", "RENTER")
        
        if role not in ["OWNER", "ADMIN"]:
            if language == "en":
                response = "You are registered as a RENTER. To list equipment, please register as an OWNER."
                suggestions = ["Find equipment", "My bookings", "Help"]
            else:
                response = "ನೀವು ಬಾಡಿಗೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿದ್ದೀರಿ. ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಲು, ದಯವಿಟ್ಟು ಮಾಲೀಕರಾಗಿ ನೋಂದಾಯಿಸಿ."
                suggestions = ["ಉಪಕರಣ ಹುಡುಕಿ", "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಸಹಾಯ"]
        else:
            if language == "en":
                if not equipment_list:
                    response = "🚜 You don't have any equipment listed yet.\n\nWould you like to add equipment for rental?"
                    suggestions = ["Add equipment", "View requests", "Help"]
                else:
                    response = f"🚜 **Your Equipment** ({len(equipment_list)} items)\n\n"
                    for i, equipment in enumerate(equipment_list[:5], 1):
                        name = equipment.get("name", "Equipment")
                        eq_type = equipment.get("type", "")
                        price_per_day = equipment.get("pricePerDay", 0)
                        available = equipment.get("available", True)
                        status = "✅ Available" if available else "❌ Not Available"
                        
                        response += f"{i}. {name} ({eq_type})\n"
                        response += f"   Price: ₹{price_per_day}/day\n"
                        response += f"   Status: {status}\n\n"
                    
                    if len(equipment_list) > 5:
                        response += f"...and {len(equipment_list) - 5} more items\n"
                    
                    suggestions = ["Add equipment", "View requests", "Update equipment", "Help"]
            else:
                if not equipment_list:
                    response = "🚜 ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಿಲ್ಲ.\n\nನೀವು ಬಾಡಿಗೆಗೆ ಉಪಕರಣವನ್ನು ಸೇರಿಸಲು ಬಯಸುವಿರಾ?"
                    suggestions = ["ಉಪಕರಣ ಸೇರಿಸಿ", "ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
                else:
                    response = f"🚜 **ನಿಮ್ಮ ಉಪಕರಣ** ({len(equipment_list)} ವಸ್ತುಗಳು)\n\n"
                    for i, equipment in enumerate(equipment_list[:5], 1):
                        name = equipment.get("name", "ಉಪಕರಣ")
                        eq_type = equipment.get("type", "")
                        price_per_day = equipment.get("pricePerDay", 0)
                        available = equipment.get("available", True)
                        status = "✅ ಲಭ್ಯವಿದೆ" if available else "❌ ಲಭ್ಯವಿಲ್ಲ"
                        
                        response += f"{i}. {name} ({eq_type})\n"
                        response += f"   ಬೆಲೆ: ₹{price_per_day}/ದಿನ\n"
                        response += f"   ಸ್ಥಿತಿ: {status}\n\n"
                    
                    if len(equipment_list) > 5:
                        response += f"...ಮತ್ತು {len(equipment_list) - 5} ಹೆಚ್ಚಿನ ವಸ್ತುಗಳು\n"
                    
                    suggestions = ["ಉಪಕರಣ ಸೇರಿಸಿ", "ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ಉಪಕರಣ ನವೀಕರಿಸಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "my_equipment",
            "language": language,
            "suggestions": suggestions,
            "data": {"equipment": equipment_list}
        }
    
    def _get_requests_response(self, language: str, user_data: Dict) -> Dict[str, Any]:
        """Generate pending requests response"""
        requests = user_data.get("requests", [])
        role = user_data.get("role", "RENTER")
        
        if role not in ["OWNER", "ADMIN"]:
            if language == "en":
                response = "You don't have any pending requests. Only equipment owners receive booking requests."
                suggestions = ["My bookings", "Find equipment", "Help"]
            else:
                response = "ನಿಮಗೆ ಯಾವುದೇ ಬಾಕಿ ವಿನಂತಿಗಳಿಲ್ಲ. ಉಪಕರಣ ಮಾಲೀಕರು ಮಾತ್ರ ಬುಕಿಂಗ್ ವಿನಂತಿಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತಾರೆ."
                suggestions = ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ಉಪಕರಣ ಹುಡುಕಿ", "ಸಹಾಯ"]
        else:
            if language == "en":
                if not requests:
                    response = "📬 You don't have any pending requests at the moment.\n\nI'll notify you when someone requests your equipment!"
                    suggestions = ["My equipment", "Add equipment", "Help"]
                else:
                    response = f"📬 **Pending Requests** ({len(requests)} total)\n\n"
                    for i, request in enumerate(requests[:5], 1):
                        equipment_name = request.get("equipmentName", "Equipment")
                        renter_name = request.get("renter", {}).get("name", "Renter")
                        start_date = request.get("startDate", "")
                        price = request.get("totalPrice", 0)
                        candidate_id = request.get("candidateId", "")
                        
                        response += f"{i}. {equipment_name}\n"
                        response += f"   Renter: {renter_name}\n"
                        response += f"   Date: {start_date}\n"
                        response += f"   Price: ₹{price}\n"
                        response += f"   ID: {candidate_id}\n\n"
                    
                    if len(requests) > 5:
                        response += f"...and {len(requests) - 5} more requests\n"
                    
                    suggestions = ["Approve request", "Reject request", "View details", "Help"]
            else:
                if not requests:
                    response = "📬 ಈ ಸಮಯದಲ್ಲಿ ನಿಮಗೆ ಯಾವುದೇ ಬಾಕಿ ವಿನಂತಿಗಳಿಲ್ಲ.\n\nಯಾರಾದರೂ ನಿಮ್ಮ ಉಪಕರಣವನ್ನು ವಿನಂತಿಸಿದಾಗ ನಾನು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇನೆ!"
                    suggestions = ["ನನ್ನ ಉಪಕರಣ", "ಉಪಕರಣ ಸೇರಿಸಿ", "ಸಹಾಯ"]
                else:
                    response = f"📬 **ಬಾಕಿ ವಿನಂತಿಗಳು** ({len(requests)} ಒಟ್ಟು)\n\n"
                    for i, request in enumerate(requests[:5], 1):
                        equipment_name = request.get("equipmentName", "ಉಪಕರಣ")
                        renter_name = request.get("renter", {}).get("name", "ಬಾಡಿಗೆದಾರ")
                        start_date = request.get("startDate", "")
                        price = request.get("totalPrice", 0)
                        candidate_id = request.get("candidateId", "")
                        
                        response += f"{i}. {equipment_name}\n"
                        response += f"   ಬಾಡಿಗೆದಾರ: {renter_name}\n"
                        response += f"   ದಿನಾಂಕ: {start_date}\n"
                        response += f"   ಬೆಲೆ: ₹{price}\n"
                        response += f"   ID: {candidate_id}\n\n"
                    
                    if len(requests) > 5:
                        response += f"...ಮತ್ತು {len(requests) - 5} ಹೆಚ್ಚಿನ ವಿನಂತಿಗಳು\n"
                    
                    suggestions = ["ವಿನಂತಿ ಅನುಮೋದಿಸಿ", "ವಿನಂತಿ ತಿರಸ್ಕರಿಸಿ", "ವಿವರಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "pending_requests",
            "language": language,
            "suggestions": suggestions,
            "data": {"requests": requests}
        }
    
    def _get_cancel_booking_response(self, language: str, user_data: Dict, message: str) -> Dict[str, Any]:
        """Handle cancel booking request"""
        # Extract booking ID from message if present
        booking_id_match = re.search(r'\b(\d+)\b', message)
        
        if language == "en":
            if booking_id_match:
                response = f"To cancel booking #{booking_id_match.group(1)}, please confirm by clicking the button below."
                suggestions = [f"Confirm cancel #{booking_id_match.group(1)}", "View bookings", "Cancel"]
            else:
                response = "Which booking would you like to cancel? Please provide the booking ID or select from your bookings."
                suggestions = ["View my bookings", "Help"]
        else:
            if booking_id_match:
                response = f"ಬುಕಿಂಗ್ #{booking_id_match.group(1)} ರದ್ದುಮಾಡಲು, ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ದೃಢೀಕರಿಸಿ."
                suggestions = [f"ರದ್ದು ದೃಢೀಕರಿಸಿ #{booking_id_match.group(1)}", "ಬುಕಿಂಗ್‌ಗಳನ್ನು ನೋಡಿ", "ರದ್ದುಮಾಡಿ"]
            else:
                response = "ನೀವು ಯಾವ ಬುಕಿಂಗ್ ಅನ್ನು ರದ್ದುಮಾಡಲು ಬಯಸುತ್ತೀರಿ? ದಯವಿಟ್ಟು ಬುಕಿಂಗ್ ID ಒದಗಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ."
                suggestions = ["ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "cancel_booking",
            "language": language,
            "suggestions": suggestions,
            "action_required": "cancel_booking",
            "booking_id": booking_id_match.group(1) if booking_id_match else None
        }
    
    def _get_approve_request_response(self, language: str, user_data: Dict, message: str) -> Dict[str, Any]:
        """Handle approve request"""
        candidate_id_match = re.search(r'\b(\d+)\b', message)
        
        if language == "en":
            if candidate_id_match:
                response = f"To approve request #{candidate_id_match.group(1)}, please confirm."
                suggestions = [f"Confirm approve #{candidate_id_match.group(1)}", "View requests", "Cancel"]
            else:
                response = "Which request would you like to approve? Please provide the request ID."
                suggestions = ["View pending requests", "Help"]
        else:
            if candidate_id_match:
                response = f"ವಿನಂತಿ #{candidate_id_match.group(1)} ಅನುಮೋದಿಸಲು, ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ."
                suggestions = [f"ಅನುಮೋದನೆ ದೃಢೀಕರಿಸಿ #{candidate_id_match.group(1)}", "ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ರದ್ದುಮಾಡಿ"]
            else:
                response = "ನೀವು ಯಾವ ವಿನಂತಿಯನ್ನು ಅನುಮೋದಿಸಲು ಬಯಸುತ್ತೀರಿ? ದಯವಿಟ್ಟು ವಿನಂತಿ ID ಒದಗಿಸಿ."
                suggestions = ["ಬಾಕಿ ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "approve_request",
            "language": language,
            "suggestions": suggestions,
            "action_required": "approve_request",
            "candidate_id": candidate_id_match.group(1) if candidate_id_match else None
        }
    
    def _get_reject_request_response(self, language: str, user_data: Dict, message: str) -> Dict[str, Any]:
        """Handle reject request"""
        candidate_id_match = re.search(r'\b(\d+)\b', message)
        
        if language == "en":
            if candidate_id_match:
                response = f"To reject request #{candidate_id_match.group(1)}, please confirm."
                suggestions = [f"Confirm reject #{candidate_id_match.group(1)}", "View requests", "Cancel"]
            else:
                response = "Which request would you like to reject? Please provide the request ID."
                suggestions = ["View pending requests", "Help"]
        else:
            if candidate_id_match:
                response = f"ವಿನಂತಿ #{candidate_id_match.group(1)} ತಿರಸ್ಕರಿಸಲು, ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ."
                suggestions = [f"ತಿರಸ್ಕಾರ ದೃಢೀಕರಿಸಿ #{candidate_id_match.group(1)}", "ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ರದ್ದುಮಾಡಿ"]
            else:
                response = "ನೀವು ಯಾವ ವಿನಂತಿಯನ್ನು ತಿರಸ್ಕರಿಸಲು ಬಯಸುತ್ತೀರಿ? ದಯವಿಟ್ಟು ವಿನಂತಿ ID ಒದಗಿಸಿ."
                suggestions = ["ಬಾಕಿ ವಿನಂತಿಗಳನ್ನು ನೋಡಿ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "reject_request",
            "language": language,
            "suggestions": suggestions,
            "action_required": "reject_request",
            "candidate_id": candidate_id_match.group(1) if candidate_id_match else None
        }
    
    def _get_default_personalized_response(self, language: str) -> Dict[str, Any]:
        """Default response for unrecognized personalized queries"""
        if language == "en":
            response = "I can help you with:\n• View your profile\n• Check your bookings\n• Manage your equipment\n• Handle requests\n\nWhat would you like to do?"
            suggestions = ["My profile", "My bookings", "My equipment", "Help"]
        else:
            response = "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು:\n• ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ನೋಡಿ\n• ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ\n• ನಿಮ್ಮ ಉಪಕರಣವನ್ನು ನಿರ್ವಹಿಸಿ\n• ವಿನಂತಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ\n\nನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?"
            suggestions = ["ನನ್ನ ಪ್ರೊಫೈಲ್", "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು", "ನನ್ನ ಉಪಕರಣ", "ಸಹಾಯ"]
        
        return {
            "response": response,
            "detected_intent": "general",
            "language": language,
            "suggestions": suggestions
        }