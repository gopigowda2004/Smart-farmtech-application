# Enhanced AI Chatbot - Testing Guide

**Date:** 2025-10-16  
**Backend Status:** ✅ Running on http://localhost:8090  
**Frontend Status:** Ready to test

---

## 🎯 What Was Fixed

### 1. **Backend Endpoints** ✅
- Added `/api/chatbot-data/renter-bookings` - Get booker's bookings
- Added `/api/chatbot-data/owner-requests` - Get owner's pending requests
- Added `/api/chatbot-data/owner-equipment` - Get owner's equipment

### 2. **Booking Candidate Creation** ✅
- Bookings created via chatbot now create BookingCandidate entries
- Owners with matching equipment will see the booking in their pending requests

### 3. **Email Notifications** ✅
- Bookers receive confirmation email when booking is created

### 4. **UI Changes** ✅
- Removed "Reject" button from accepter account (only "Accept" button remains)

---

## 🧪 Testing Scenarios

### Scenario 1: Booker Views Bookings

**Steps:**
1. Start frontend: `npm start` in `farmer-rental-app` directory
2. Login as a RENTER user
3. Open the AI chatbot (click chatbot icon)
4. Click "View My Bookings" button

**Expected Result:**
- ✅ Should display list of bookings (if any exist)
- ✅ No error message: "❌ ಬುಕಿಂಗ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ"
- ✅ Each booking shows: equipment name, dates, duration, cost, status

**API Endpoint Being Called:**
```
GET http://localhost:8090/api/chatbot-data/renter-bookings?userId={userId}
```

---

### Scenario 2: Owner Views Pending Requests

**Steps:**
1. Login as an OWNER user
2. Open the AI chatbot
3. Click "View Pending Requests" button

**Expected Result:**
- ✅ Should display list of pending booking requests (if any exist)
- ✅ No error message: "❌ ವಿನಂತಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ"
- ✅ Each request shows: equipment name, renter name, dates, duration, cost, distance
- ✅ Only "Accept" button visible (NO "Reject" button)

**API Endpoint Being Called:**
```
GET http://localhost:8090/api/chatbot-data/owner-requests?farmerId={farmerId}
```

---

### Scenario 3: Owner Views Equipment

**Steps:**
1. Login as an OWNER user
2. Open the AI chatbot
3. Click "View My Equipment" button (if available)

**Expected Result:**
- ✅ Should display list of owner's equipment
- ✅ Each equipment shows: name, type, price per hour

**API Endpoint Being Called:**
```
GET http://localhost:8090/api/chatbot-data/owner-equipment?farmerId={farmerId}
```

---

### Scenario 4: Create Booking via Chatbot (CRITICAL TEST)

**Steps:**
1. Login as a RENTER user
2. Open the AI chatbot
3. Start a conversation to book equipment:
   - Example: "I need a tractor for 5 hours"
   - Follow the chatbot's prompts
   - Provide: equipment type, location, date, duration
4. Complete the booking

**Expected Results:**

✅ **Immediate Effects:**
- Booking created successfully
- Success message displayed in chatbot
- Booker receives confirmation email at their registered email address

✅ **Booker's View:**
- Go to "View My Bookings"
- New booking should appear in the list
- Status should be "PENDING" or "CONFIRMED"

✅ **Owner's View (for owners with matching equipment):**
- Login as an OWNER who has the equipment type that was booked
- Open chatbot → "View Pending Requests"
- New booking request should appear in the list
- Shows: renter name, equipment, dates, duration, cost, distance
- Only "Accept" button visible

✅ **Database Changes:**
- New `Booking` record created
- Multiple `BookingCandidate` records created (one for each owner with matching equipment)
- Each candidate has status = "PENDING"
- Distance calculated between booking location and owner location

**API Endpoint Being Called:**
```
POST http://localhost:8090/api/chatbot-data/create-booking
Body: {
  userId, equipmentId, startDate, hours, 
  location, locationLatitude, locationLongitude, totalCost
}
```

---

### Scenario 5: Accept Booking Request

**Steps:**
1. Login as an OWNER user
2. Open chatbot → "View Pending Requests"
3. Find a pending request
4. Click "✅ Accept" button

**Expected Results:**
- ✅ Request accepted successfully
- ✅ Request removed from pending list
- ✅ Booking status updated to "CONFIRMED"
- ✅ Owner receives acceptance confirmation email
- ✅ NO "Reject" button visible

---

## 🔍 Manual API Testing (Using curl or Postman)

### Test 1: Get Renter Bookings
```bash
curl http://localhost:8090/api/chatbot-data/renter-bookings?userId=1
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "status": "PENDING",
    "startDate": "2025-10-20",
    "endDate": "2025-10-20",
    "duration": 5,
    "totalCost": 500.0,
    "location": "Bangalore",
    "equipmentName": "Tractor",
    "equipmentType": "TRACTOR"
  }
]
```

---

### Test 2: Get Owner Requests
```bash
curl http://localhost:8090/api/chatbot-data/owner-requests?farmerId=2
```

**Expected Response:**
```json
[
  {
    "candidateId": 1,
    "bookingId": 1,
    "distance": 15.5,
    "startDate": "2025-10-20",
    "duration": 5,
    "totalCost": 500.0,
    "location": "Bangalore",
    "equipmentName": "Tractor",
    "equipmentType": "TRACTOR",
    "renterName": "John Doe",
    "renterPhone": "9876543210"
  }
]
```

---

### Test 3: Get Owner Equipment
```bash
curl http://localhost:8090/api/chatbot-data/owner-equipment?farmerId=2
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Tractor XYZ",
    "type": "TRACTOR",
    "pricePerHour": 100.0
  }
]
```

---

### Test 4: Create Booking
```bash
curl -X POST http://localhost:8090/api/chatbot-data/create-booking \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "equipmentId": 1,
    "startDate": "2025-10-20",
    "hours": 5,
    "location": "Bangalore",
    "locationLatitude": 12.9716,
    "locationLongitude": 77.5946,
    "totalCost": 500.0
  }'
```

**Expected Response:**
```json
{
  "message": "Booking created successfully",
  "bookingId": 1
}
```

---

## 📧 Email Testing

### Check Email Delivery

**After creating a booking via chatbot:**

1. **Check Booker's Email:**
   - Email should be sent to the booker's registered email
   - Subject: "Booking Confirmation"
   - Content should include:
     - Equipment name
     - Start date
     - Duration (hours)
     - Total cost
     - Booking ID

2. **Email Configuration:**
   - Check `application.properties`:
     ```properties
     email.enabled=true
     spring.mail.host=smtp.gmail.com
     spring.mail.username=gopigowda132@gmail.com
     ```

3. **If Email Not Received:**
   - Check backend logs for email sending errors
   - Verify email address is correct in user profile
   - Check spam/junk folder
   - Verify Gmail app password is valid

---

## 🐛 Troubleshooting

### Issue: "Failed to load bookings" error

**Possible Causes:**
1. Backend not running
2. User doesn't have a Farmer record
3. Network error

**Solution:**
- Check backend is running: `curl http://localhost:8090/actuator/health`
- Check browser console for error details
- Verify userId is correct

---

### Issue: "Failed to load requests" error

**Possible Causes:**
1. Backend not running
2. FarmerId is null or invalid
3. No pending requests exist

**Solution:**
- Check backend logs
- Verify user has OWNER role
- Create a test booking to generate requests

---

### Issue: Booking created but not appearing in owner's requests

**Possible Causes:**
1. No owners have matching equipment type
2. BookingCandidate creation failed
3. Owner doesn't have Farmer record

**Solution:**
- Check backend logs for "CANDIDATE CREATION" messages
- Verify at least one owner has equipment matching the booking's equipment type
- Check database: `SELECT * FROM booking_candidate WHERE booking_id = ?`

---

### Issue: Email not received

**Possible Causes:**
1. Email service disabled
2. Invalid email address
3. Gmail app password expired
4. Email in spam folder

**Solution:**
- Check `application.properties`: `email.enabled=true`
- Check backend logs for email errors
- Verify email address in user profile
- Check spam/junk folder
- Test Gmail credentials

---

## 📊 Database Verification

### Check Booking Creation
```sql
SELECT * FROM booking ORDER BY id DESC LIMIT 5;
```

### Check Booking Candidates
```sql
SELECT bc.id, bc.status, bc.distance_km, 
       b.id as booking_id, b.location,
       f.name as owner_name
FROM booking_candidate bc
JOIN booking b ON bc.booking_id = b.id
JOIN farmer f ON bc.owner_id = f.id
WHERE bc.status = 'PENDING'
ORDER BY bc.id DESC;
```

### Check User-Farmer Mapping
```sql
SELECT u.id as user_id, u.name as user_name, u.phone, u.role,
       f.id as farmer_id, f.name as farmer_name
FROM user u
LEFT JOIN farmer f ON u.phone = f.phone
WHERE u.role IN ('OWNER', 'RENTER');
```

---

## ✅ Success Criteria

All tests pass if:

- [x] Backend compiles and runs without errors
- [ ] Booker can view their bookings (no error message)
- [ ] Owner can view pending requests (no error message)
- [ ] Owner can view their equipment (no error message)
- [ ] Booking created via chatbot appears in booker's bookings
- [ ] Booking created via chatbot appears in matching owners' requests
- [ ] Booker receives confirmation email
- [ ] Only "Accept" button visible (no "Reject" button)
- [ ] Accept button works correctly
- [ ] Distance calculated correctly between booker and owner

---

## 🚀 Quick Start Testing

**Fastest way to test everything:**

1. **Start Backend:**
   ```bash
   cd "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend"
   mvn spring-boot:run
   ```

2. **Start Frontend:**
   ```bash
   cd "c:\Users\gopig\OneDrive\Documents\final year\FarmTech34\farmer-rental-app"
   npm start
   ```

3. **Create Test Data:**
   - Register 2 users: one RENTER, one OWNER
   - Owner should add equipment (e.g., Tractor)

4. **Test Booking Flow:**
   - Login as RENTER
   - Open chatbot
   - Create booking for Tractor
   - Check email for confirmation
   - Logout

5. **Test Owner View:**
   - Login as OWNER
   - Open chatbot
   - Click "View Pending Requests"
   - Should see the booking request
   - Verify only "Accept" button visible
   - Click Accept

6. **Verify Results:**
   - Login as RENTER again
   - Check booking status (should be CONFIRMED)

---

**End of Testing Guide**