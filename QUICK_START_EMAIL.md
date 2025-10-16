# Quick Start: Email Notifications

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already enabled)
3. Search for "App passwords" in the search bar
4. Click "App passwords"
5. Select "Mail" and "Windows Computer"
6. Click "Generate"
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Configuration
Open: `backend/src/main/resources/application.properties`

Replace these lines:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

With your actual credentials:
```properties
spring.mail.username=yourname@gmail.com
spring.mail.password=abcdefghijklmnop
```
(Remove spaces from the app password)

### Step 3: Restart Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Step 4: Test It!
1. **Create a booking** → Check booker's email
2. **Accept the booking** → Check both booker's and owner's emails

---

## 📧 What Emails Are Sent?

### Email 1: Booking Created
**To:** Booker  
**When:** Immediately after creating a booking  
**Contains:**
- Equipment name
- Start date and hours
- Booking ID
- Status: PENDING

### Email 2: Booking Accepted (to Booker)
**To:** Booker  
**When:** Owner accepts the booking  
**Contains:**
- Equipment name
- Booking ID
- Status: CONFIRMED
- Owner's name and phone

### Email 3: Booking Accepted (to Owner)
**To:** Owner who accepted  
**When:** Owner accepts the booking  
**Contains:**
- Equipment name
- Start date, hours, location
- Booking ID
- Booker's name, phone, and email

---

## 🔧 Troubleshooting

### Emails not sending?

**Check 1:** Is email enabled?
```properties
email.enabled=true  # Must be true
```

**Check 2:** Are credentials correct?
- Username should be full email: `yourname@gmail.com`
- Password should be 16-char app password (no spaces)

**Check 3:** Check console logs
Look for:
- ✅ `[EmailService] ✅ Email sent successfully to [email]`
- ❌ `[EmailService] ❌ Failed to send email`

**Check 4:** Gmail blocking?
- Make sure you're using App Password, not regular password
- Check if 2-Step Verification is enabled

### Testing without real emails?
Set in application.properties:
```properties
email.enabled=false
```
Emails will be printed to console instead.

---

## 📝 Quick Reference

| Configuration | Location | Default |
|--------------|----------|---------|
| Enable/Disable | `email.enabled` | `true` |
| SMTP Host | `spring.mail.host` | `smtp.gmail.com` |
| SMTP Port | `spring.mail.port` | `587` |
| Username | `spring.mail.username` | (your email) |
| Password | `spring.mail.password` | (app password) |

---

## ⚠️ Important Notes

1. **Never commit real credentials to Git**
2. **Use App Password, not your Gmail password**
3. **Email failures won't break booking flow** (they're logged but ignored)
4. **Users must have valid email addresses** in the database

---

## 🎯 That's It!

You're ready to use email notifications. For detailed setup and troubleshooting, see `EMAIL_SETUP_GUIDE.md`.