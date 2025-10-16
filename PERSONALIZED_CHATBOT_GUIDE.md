# 🤖 Personalized AI Chatbot Guide

## Overview

The FarmTech chatbot now includes **personalized features** that provide role-based responses and actions based on user data. The chatbot automatically detects logged-in users and provides customized information about their bookings, equipment, and requests.

---

## 🎯 Features

### **For All Users:**
- ✅ View profile information
- ✅ Bilingual support (English & Kannada)
- ✅ General equipment queries
- ✅ Rental process information

### **For RENTERS (Bookers):**
- ✅ View all bookings with status
- ✅ Check booking details (equipment, dates, prices)
- ✅ Cancel bookings
- ✅ Track booking status (PENDING, CONFIRMED, COMPLETED)

### **For OWNERS (Accepters):**
- ✅ View owned equipment list
- ✅ Check equipment availability status
- ✅ View pending booking requests
- ✅ Approve booking requests
- ✅ Reject booking requests
- ✅ See renter details for each request

### **For ADMINS:**
- ✅ All RENTER features
- ✅ All OWNER features
- ✅ Full access to all data

---

## 💬 Personalized Queries

### **Profile Queries**

**English:**
- "Show my profile"
- "My account details"
- "Who am I?"
- "My information"

**Kannada:**
- "ನನ್ನ ಪ್ರೊಫೈಲ್ ತೋರಿಸಿ"
- "ನನ್ನ ಖಾತೆ ವಿವರಗಳು"
- "ನನ್ನ ಮಾಹಿತಿ"

**Response includes:**
- Name
- Role (RENTER/OWNER/ADMIN)
- Location (District)
- Farm size
- Crop type

---

### **Booking Queries (RENTER)**

**English:**
- "Show my bookings"
- "My orders"
- "My rentals"
- "View my bookings"
- "Booking status"

**Kannada:**
- "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ತೋರಿಸಿ"
- "ನನ್ನ ಆರ್ಡರ್‌ಗಳು"
- "ನನ್ನ ಬಾಡಿಗೆಗಳು"
- "ಬುಕಿಂಗ್ ಸ್ಥಿತಿ"

**Response includes:**
- List of all bookings (up to 5 shown)
- Equipment name and type
- Booking status
- Start/end dates
- Total price
- Booking ID

---

### **Equipment Queries (OWNER)**

**English:**
- "My equipment"
- "My machines"
- "Equipment I own"
- "What equipment do I have?"

**Kannada:**
- "ನನ್ನ ಉಪಕರಣ"
- "ನನ್ನ ಯಂತ್ರಗಳು"
- "ನಾನು ಹೊಂದಿರುವ ಉಪಕರಣ"

**Response includes:**
- List of owned equipment (up to 5 shown)
- Equipment name and type
- Price per day
- Availability status (Available/Not Available)
- Equipment ID

---

### **Request Queries (OWNER)**

**English:**
- "Pending requests"
- "New requests"
- "Booking requests"
- "Show my requests"

**Kannada:**
- "ಬಾಕಿ ವಿನಂತಿಗಳು"
- "ಹೊಸ ವಿನಂತಿಗಳು"
- "ಬುಕಿಂಗ್ ವಿನಂತಿಗಳು"

**Response includes:**
- List of pending requests (up to 5 shown)
- Equipment name
- Renter name and phone
- Booking dates
- Total price
- Request ID (for approval/rejection)

---

### **Action Queries**

#### **Cancel Booking (RENTER)**

**English:**
- "Cancel booking"
- "Cancel my order"
- "Cancel booking #123"

**Kannada:**
- "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ"
- "ನನ್ನ ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ"

**Process:**
1. Chatbot asks for booking ID (if not provided)
2. Shows confirmation request
3. User confirms
4. Booking is cancelled

#### **Approve Request (OWNER)**

**English:**
- "Approve request"
- "Accept request #456"
- "Confirm booking"

**Kannada:**
- "ವಿನಂತಿ ಅನುಮೋದಿಸಿ"
- "ವಿನಂತಿ ಸ್ವೀಕರಿಸಿ"

**Process:**
1. Chatbot asks for request ID (if not provided)
2. Shows confirmation request
3. User confirms
4. Request is approved, booking confirmed

#### **Reject Request (OWNER)**

**English:**
- "Reject request"
- "Decline request #456"
- "Deny request"

**Kannada:**
- "ವಿನಂತಿ ತಿರಸ್ಕರಿಸಿ"
- "ವಿನಂತಿ ನಿರಾಕರಿಸಿ"

**Process:**
1. Chatbot asks for request ID (if not provided)
2. Shows confirmation request
3. User confirms
4. Request is rejected

---

## 🔧 Technical Implementation

### **Architecture**

```
Frontend (React)
    ↓
Backend (Spring Boot) - Port 8090
    ↓
ML Service (Python Flask) - Port 5002
    ↓
ChatbotDataController - Fetches user data
    ↓
PersonalizedChatbot - Generates personalized responses
```

### **Data Flow**

1. **User sends message** → Frontend captures userId from localStorage
2. **Frontend → Backend** → Sends message + userId + language
3. **Backend → ML Service** → Forwards request
4. **ML Service** → Fetches user data from Backend API
5. **ML Service** → Generates personalized response
6. **Response flows back** → User sees personalized information

### **New Backend Endpoints**

#### **GET /api/chatbot-data/user/{userId}**
Fetches comprehensive user data including:
- Profile information
- Bookings (for renters)
- Equipment (for owners)
- Pending requests (for owners)

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "role": "RENTER",
  "email": "john@example.com",
  "phone": "9876543210",
  "district": "Bangalore",
  "farmSize": "5 acres",
  "cropType": "Paddy",
  "bookings": [
    {
      "id": 101,
      "status": "CONFIRMED",
      "startDate": "2024-01-15",
      "totalPrice": 2000,
      "equipment": {
        "name": "Mahindra Tractor",
        "type": "Tractor"
      }
    }
  ]
}
```

#### **POST /api/chatbot-data/action**
Performs actions (cancel, approve, reject)

**Request:**
```json
{
  "action": "cancel_booking",
  "userId": 1,
  "bookingId": 101
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "bookingId": 101
}
```

---

## 🚀 Usage Examples

### **Example 1: Renter Checks Bookings**

**User:** "Show my bookings"

**Chatbot Response:**
```
📋 Your Bookings (2 total)

1. Mahindra Tractor
   Status: CONFIRMED
   Date: 2024-01-15
   Price: ₹2000

2. Rotavator
   Status: PENDING
   Date: 2024-01-20
   Price: ₹1500

[Cancel booking] [View details] [New booking] [Help]
```

### **Example 2: Owner Views Requests**

**User:** "ಬಾಕಿ ವಿನಂತಿಗಳು" (Pending requests)

**Chatbot Response:**
```
📬 ಬಾಕಿ ವಿನಂತಿಗಳು (3 ಒಟ್ಟು)

1. Mahindra Tractor
   ಬಾಡಿಗೆದಾರ: Ramesh Kumar
   ದಿನಾಂಕ: 2024-01-15
   ಬೆಲೆ: ₹2000
   ID: 456

2. Harvester
   ಬಾಡಿಗೆದಾರ: Suresh Gowda
   ದಿನಾಂಕ: 2024-01-18
   ಬೆಲೆ: ₹3500
   ID: 457

[ವಿನಂತಿ ಅನುಮೋದಿಸಿ] [ವಿನಂತಿ ತಿರಸ್ಕರಿಸಿ] [ವಿವರಗಳನ್ನು ನೋಡಿ] [ಸಹಾಯ]
```

### **Example 3: Owner Approves Request**

**User:** "Approve request 456"

**Chatbot Response:**
```
To approve request #456, please confirm.

[Confirm approve #456] [View requests] [Cancel]
```

**User clicks:** "Confirm approve #456"

**Chatbot Response:**
```
✅ Request approved successfully!

The booking has been confirmed. The renter will be notified.

[View requests] [My equipment] [Help]
```

---

## 🎨 UI Features

### **Personalized Greeting**
When a logged-in user opens the chatbot:
```
Hello, Ramesh! 👋

I can help you with:
• View your bookings
• Check equipment status
• Manage requests
• General queries

What would you like to do?

[My bookings] [My equipment] [Find equipment] [Help]
```

### **Smart Suggestions**
Suggestions change based on:
- User role (RENTER/OWNER/ADMIN)
- Current context
- Previous queries

### **Rich Formatting**
- ✅ Status indicators
- 📋 Icons for different sections
- 🚜 Equipment emojis
- 📬 Request notifications
- Numbered lists for easy reference

---

## 🔐 Security & Privacy

### **Authentication**
- User ID is automatically retrieved from localStorage
- No password required in chatbot
- Backend validates user ownership before actions

### **Authorization**
- Renters can only see/cancel their own bookings
- Owners can only manage their own equipment/requests
- Admins have full access

### **Data Protection**
- User data is fetched on-demand (not cached)
- Sensitive information (passwords) never exposed
- All API calls use secure endpoints

---

## 📊 Benefits

### **For Users:**
- ⚡ **Faster access** to information (no navigation needed)
- 🗣️ **Natural language** queries in English or Kannada
- 📱 **Mobile-friendly** chat interface
- 🎯 **Contextual** responses based on role

### **For Business:**
- 📈 **Increased engagement** (users interact more)
- 🤝 **Better UX** (easier to find information)
- 🌐 **Accessibility** (language barrier removed)
- 💡 **Insights** (track common queries)

---

## 🛠️ Setup & Configuration

### **1. Install Dependencies**
```bash
cd ml-service
pip install -r requirements.txt
```

### **2. Start Services**

**Option A: All services**
```powershell
.\start_all_services.ps1
```

**Option B: Manual**
```powershell
# Terminal 1 - ML Service
cd ml-service
python app.py

# Terminal 2 - Backend
cd backend
mvn spring-boot:run

# Terminal 3 - Frontend
cd farmer-rental-app
npm start
```

### **3. Test Personalization**

1. **Login** to the application
2. **Open chatbot** (💬 button)
3. **Try queries:**
   - "Show my profile"
   - "My bookings"
   - "My equipment" (if owner)
   - "Pending requests" (if owner)

---

## 🐛 Troubleshooting

### **Issue: Chatbot doesn't show personalized data**

**Solution:**
1. Check if you're logged in (userId in localStorage)
2. Verify backend is running (port 8090)
3. Check ML service logs for errors
4. Ensure ChatbotDataController is accessible

### **Issue: Actions (cancel/approve) don't work**

**Solution:**
1. Verify you have permission (own the booking/equipment)
2. Check backend logs for authorization errors
3. Ensure booking/request ID is correct

### **Issue: Response is in wrong language**

**Solution:**
1. Toggle language using 🌐 button
2. Clear chat and restart
3. Check language setting in localStorage

---

## 📝 Future Enhancements

### **Planned Features:**
- 🔔 **Push notifications** for new requests
- 📊 **Analytics dashboard** in chatbot
- 🗓️ **Calendar integration** for bookings
- 💬 **Chat history** persistence
- 🎤 **Voice input/output**
- 📸 **Image sharing** for equipment issues
- 🤖 **AI-powered recommendations**
- 📍 **Location-based suggestions**

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review console logs (F12 → Console)
3. Check backend logs
4. Review API responses

---

## 🎉 Summary

The personalized chatbot transforms FarmTech into an intelligent assistant that:
- **Knows who you are** (role-based responses)
- **Shows your data** (bookings, equipment, requests)
- **Performs actions** (cancel, approve, reject)
- **Speaks your language** (English & Kannada)
- **Understands context** (natural language queries)

**Result:** A seamless, personalized experience that makes equipment rental easier for farmers! 🚜🌾