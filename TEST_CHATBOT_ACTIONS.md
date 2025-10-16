# 🧪 Quick Test Guide - Chatbot Actions

## Prerequisites
- ✅ Backend running on port 8090
- ✅ ML Service running on port 5002
- ✅ Frontend running on port 3000
- ✅ User logged in (userId in localStorage)

---

## 🎯 Test Scenario 1: Cancel Booking (Renter)

### **Setup:**
1. Login as a RENTER user
2. Make sure you have at least one booking in the database

### **Test Steps:**

**Step 1:** Open chatbot and ask:
```
My bookings
```

**Expected Result:**
```
📋 Your Bookings (X total)

1. [Equipment Name]
   Status: [STATUS]
   Date: [DATE]
   Price: ₹[PRICE]
   ID: [BOOKING_ID]

[Cancel booking] [View details] [New booking] [Help]
```

**Step 2:** Type (replace [ID] with actual booking ID):
```
Cancel booking [ID]
```

**Expected Result:**
```
To cancel booking #[ID], please confirm by clicking the button below.

[Confirm cancel #[ID]] [View bookings] [Cancel]
```

**Step 3:** Click the "Confirm cancel #[ID]" suggestion chip

**Expected Result:**
```
✅ Booking #[ID] has been cancelled successfully!

You can make a new booking anytime.

[My bookings] [Find equipment] [Help]
```

**Step 4:** Verify in database:
```sql
SELECT * FROM bookings WHERE id = [ID];
-- status should be 'CANCELLED'
```

---

## 🎯 Test Scenario 2: Approve Request (Owner)

### **Setup:**
1. Login as an OWNER user
2. Make sure you have at least one pending booking request for your equipment

### **Test Steps:**

**Step 1:** Open chatbot and ask:
```
Pending requests
```

**Expected Result:**
```
📬 Pending Requests (X total)

1. [Equipment Name]
   Renter: [Renter Name]
   Date: [DATE]
   Price: ₹[PRICE]
   ID: [CANDIDATE_ID]

[Approve request] [Reject request] [View details] [Help]
```

**Step 2:** Type (replace [ID] with actual candidate ID):
```
Approve request [ID]
```

**Expected Result:**
```
To approve request #[ID], please confirm.

[Confirm approve #[ID]] [View requests] [Cancel]
```

**Step 3:** Click the "Confirm approve #[ID]" suggestion chip

**Expected Result:**
```
✅ Request #[ID] has been approved successfully!

The booking is now confirmed. The renter will be notified.

[Pending requests] [My equipment] [Help]
```

**Step 4:** Verify in database:
```sql
SELECT * FROM booking_candidates WHERE id = [ID];
-- status should be 'ACCEPTED'

SELECT * FROM bookings WHERE id = (SELECT booking_id FROM booking_candidates WHERE id = [ID]);
-- status should be 'CONFIRMED'
```

---

## 🎯 Test Scenario 3: Reject Request (Owner)

### **Setup:**
1. Login as an OWNER user
2. Make sure you have at least one pending booking request

### **Test Steps:**

**Step 1:** Ask:
```
Pending requests
```

**Step 2:** Type (replace [ID] with actual candidate ID):
```
Reject request [ID]
```

**Expected Result:**
```
To reject request #[ID], please confirm.

[Confirm reject #[ID]] [View requests] [Cancel]
```

**Step 3:** Click the "Confirm reject #[ID]" suggestion chip

**Expected Result:**
```
✅ Request #[ID] has been rejected.

The renter will be notified that their request was declined.

[Pending requests] [My equipment] [Help]
```

**Step 4:** Verify in database:
```sql
SELECT * FROM booking_candidates WHERE id = [ID];
-- status should be 'REJECTED'
```

---

## 🌐 Test Scenario 4: Bilingual Support

### **Test in Kannada:**

**Step 1:** Toggle language to Kannada (click "ಕನ್ನಡ" button)

**Step 2:** Ask:
```
ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು
```

**Expected:** Bookings displayed in Kannada

**Step 3:** Type:
```
ಬುಕಿಂಗ್ [ID] ರದ್ದುಮಾಡಿ
```

**Expected:** Confirmation message in Kannada

**Step 4:** Click confirmation suggestion

**Expected:** Success message in Kannada

---

## 🔐 Test Scenario 5: Security (Negative Tests)

### **Test 1: Cancel Someone Else's Booking**

**Setup:** Login as User A

**Step 1:** Get a booking ID that belongs to User B

**Step 2:** Try to cancel:
```
Cancel booking [USER_B_BOOKING_ID]
```

**Step 3:** Click confirmation

**Expected Result:**
```
❌ Failed to cancel booking: You don't have permission to cancel this booking

Please try again or contact support.

[My bookings] [Help]
```

### **Test 2: Approve Request for Equipment You Don't Own**

**Setup:** Login as Owner A

**Step 1:** Get a candidate ID for equipment owned by Owner B

**Step 2:** Try to approve:
```
Approve request [OWNER_B_CANDIDATE_ID]
```

**Step 3:** Click confirmation

**Expected Result:**
```
❌ Failed to approve request: You don't have permission to approve this request

Please try again or contact support.

[Pending requests] [Help]
```

---

## 🎨 Test Scenario 6: User Experience

### **Test: Cancel Action Flow**

**Step 1:** Ask "My bookings"
- ✅ Bookings displayed with IDs
- ✅ Suggestion chips appear

**Step 2:** Click "Cancel booking" suggestion
- ✅ Chatbot asks which booking to cancel
- ✅ Helpful suggestions provided

**Step 3:** Type "Cancel booking [ID]"
- ✅ Confirmation message appears
- ✅ Clear action buttons shown

**Step 4:** Click "Cancel" (not confirm)
- ✅ Action cancelled
- ✅ User can continue chatting

**Step 5:** Type "Cancel booking [ID]" again
- ✅ Confirmation appears again

**Step 6:** Click "Confirm cancel #[ID]"
- ✅ Success message appears
- ✅ Next steps suggested
- ✅ Booking actually cancelled in database

---

## 📊 Test Results Template

### **Test Date:** [DATE]
### **Tester:** [YOUR NAME]

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| Cancel Booking (English) | ⬜ Pass / ⬜ Fail | |
| Cancel Booking (Kannada) | ⬜ Pass / ⬜ Fail | |
| Approve Request (English) | ⬜ Pass / ⬜ Fail | |
| Approve Request (Kannada) | ⬜ Pass / ⬜ Fail | |
| Reject Request (English) | ⬜ Pass / ⬜ Fail | |
| Reject Request (Kannada) | ⬜ Pass / ⬜ Fail | |
| Security - Unauthorized Cancel | ⬜ Pass / ⬜ Fail | |
| Security - Unauthorized Approve | ⬜ Pass / ⬜ Fail | |
| Database Updates Correctly | ⬜ Pass / ⬜ Fail | |
| Error Messages Clear | ⬜ Pass / ⬜ Fail | |

---

## 🐛 Common Issues & Solutions

### **Issue: Confirmation button doesn't appear**
**Check:**
- [ ] User is logged in (check localStorage.userId)
- [ ] ML service is running
- [ ] Backend is running
- [ ] Browser console for errors

### **Issue: Action fails with error**
**Check:**
- [ ] User has permission (owns the booking/equipment)
- [ ] ID is correct
- [ ] Item hasn't already been cancelled/processed
- [ ] Backend logs for detailed error

### **Issue: Success message but database not updated**
**Check:**
- [ ] Database connection
- [ ] Backend logs for SQL errors
- [ ] Transaction committed
- [ ] Refresh database view

---

## 🎯 Quick Test Commands

### **For Renters:**
```
My bookings
Cancel booking 1
Confirm cancel #1
```

### **For Owners:**
```
Pending requests
Approve request 1
Confirm approve #1

Pending requests
Reject request 2
Confirm reject #2
```

### **In Kannada:**
```
ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು
ಬುಕಿಂಗ್ 1 ರದ್ದುಮಾಡಿ
ರದ್ದು ದೃಢೀಕರಿಸಿ #1

ಬಾಕಿ ವಿನಂತಿಗಳು
ವಿನಂತಿ 1 ಅನುಮೋದಿಸಿ
ಅನುಮೋದನೆ ದೃಢೀಕರಿಸಿ #1
```

---

## 📸 Screenshots to Capture

For your presentation/documentation:

1. **Booking List with IDs**
2. **Cancel Confirmation Dialog**
3. **Success Message**
4. **Pending Requests List**
5. **Approve Confirmation**
6. **Reject Confirmation**
7. **Error Message (unauthorized)**
8. **Kannada Version**

---

## ✅ Final Checklist

Before marking testing complete:

- [ ] All positive tests pass
- [ ] All negative tests pass (security)
- [ ] Both languages work
- [ ] Database updates correctly
- [ ] Error messages are clear
- [ ] Success messages are clear
- [ ] Suggestions are contextual
- [ ] No console errors
- [ ] Performance is acceptable (<2 seconds)
- [ ] Mobile responsive (if applicable)

---

## 🎉 Success Criteria

**All tests pass when:**
- ✅ Users can cancel their bookings
- ✅ Owners can approve/reject requests
- ✅ Unauthorized actions are blocked
- ✅ Database updates correctly
- ✅ Both languages work perfectly
- ✅ User experience is smooth
- ✅ Error handling is graceful

---

*Happy Testing! 🚀*