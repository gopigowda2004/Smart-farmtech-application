# Email Notification Setup Guide

## Overview
The FarmTech34 application now supports email notifications for booking events:
1. **When a booking is created** → Email sent to the booker with booking details
2. **When a booking is accepted** → Emails sent to both:
   - The booker (with owner contact information)
   - The owner who accepted (with booker contact information)

## Configuration Steps

### 1. Enable/Disable Email Feature
In `application.properties`, set:
```properties
email.enabled=true  # Set to false to disable email notifications
```

### 2. Configure Email Server (Gmail Example)

#### Option A: Using Gmail
1. **Get Gmail App Password** (Recommended for security):
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification (enable if not already)
   - Go to Security → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Update application.properties**:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

#### Option B: Using Other Email Providers

**Outlook/Hotmail:**
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

**Yahoo:**
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=your-email@yahoo.com
spring.mail.password=your-app-password
```

**Custom SMTP Server:**
```properties
spring.mail.host=smtp.your-domain.com
spring.mail.port=587
spring.mail.username=your-email@your-domain.com
spring.mail.password=your-password
```

### 3. Testing Without Real Email Server
If you want to test the application without setting up email:
```properties
email.enabled=false
```
The system will log email content to console instead of sending actual emails.

## Email Templates

### 1. Booking Confirmation Email (to Booker)
**Subject:** Booking Confirmation - [Equipment Name]

**Content:**
- Booker name
- Equipment name
- Start date
- Duration (hours)
- Booking ID
- Status: PENDING

### 2. Booking Acceptance Email (to Booker)
**Subject:** Booking Accepted - [Equipment Name]

**Content:**
- Booker name
- Equipment name
- Booking ID
- Status: CONFIRMED
- Owner name and phone number

### 3. Booking Acceptance Email (to Owner)
**Subject:** You Accepted a Booking - [Equipment Name]

**Content:**
- Owner name
- Equipment name
- Start date
- Duration (hours)
- Location
- Booking ID
- Booker name, phone, and email

## Troubleshooting

### Email Not Sending
1. **Check email.enabled setting** in application.properties
2. **Verify SMTP credentials** are correct
3. **Check firewall/antivirus** - ensure port 587 is not blocked
4. **Review console logs** for error messages
5. **Verify user email addresses** are valid in the database

### Gmail "Less Secure Apps" Error
- Use App Passwords instead of your regular password
- Enable 2-Step Verification first
- Generate a new App Password specifically for this application

### Connection Timeout
- Check your internet connection
- Verify SMTP host and port are correct
- Try using port 465 with SSL instead of 587 with TLS:
```properties
spring.mail.port=465
spring.mail.properties.mail.smtp.ssl.enable=true
```

## Security Best Practices

1. **Never commit credentials to Git**
   - Add application.properties to .gitignore
   - Use environment variables for production

2. **Use App Passwords**
   - Don't use your main email password
   - Generate app-specific passwords

3. **Environment Variables (Production)**
```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

Then in application.properties:
```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

## Testing the Email Feature

1. **Create a booking** as a renter
   - Check the booker's email inbox for confirmation

2. **Accept the booking** as an owner
   - Check both booker's and owner's email inboxes

3. **Check console logs** for email sending status:
   - `[EmailService] ✅ Email sent successfully to [email]`
   - `📧 Sent acceptance email to booker: [email]`
   - `📧 Sent acceptance email to owner: [email]`

## Development Mode
For development/testing without real emails:
```properties
email.enabled=false
```
All email content will be logged to console for verification.