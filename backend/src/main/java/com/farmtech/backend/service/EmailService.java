package com.farmtech.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import jakarta.annotation.PostConstruct;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@farmtech.com}")
    private String fromEmail;

    @Value("${email.enabled:false}")
    private boolean emailEnabled;
    
    @PostConstruct
    public void init() {
        System.out.println("📧 [EmailService] Initializing...");
        System.out.println("   Email Enabled: " + emailEnabled);
        System.out.println("   Mail Sender: " + (mailSender != null ? "✅ Configured" : "⚠️ NOT CONFIGURED"));
        System.out.println("   From Email: " + fromEmail);
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Your FarmTech OTP Code";
        String body = String.format(
                "Dear user,%n%n" +
                "We received a request to sign in to your FarmTech account.%n" +
                "Please use the following One-Time Password (OTP) to complete your login:%n%n" +
                "OTP: %s%n%n" +
                "This code is valid for the next 5 minutes. If you did not request this, you can ignore this message.%n%n" +
                "Regards,%n" +
                "FarmTech Support Team",
                otp
        );

        sendEmail(to, subject, body);
    }

    public void sendEmailHtml(String to, String subject, String htmlBody) {
        System.out.println("\n========== 📧 SENDEMAILER HTML ==========");
        System.out.println("Timestamp: " + new java.util.Date());
        System.out.println("Email Enabled: " + emailEnabled);
        System.out.println("Mail Sender Configured: " + (mailSender != null));
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body length: " + (htmlBody != null ? htmlBody.length() : 0) + " chars");
        System.out.println("From Email: " + fromEmail);
        System.out.println("Thread: " + Thread.currentThread().getName());
        
        if (!emailEnabled) {
            System.out.println("❌ Email feature is DISABLED in application.properties");
            System.out.println("========================================\n");
            return;
        }

        if (to == null || to.isBlank()) {
            System.out.println("❌ Recipient email is EMPTY or NULL. Skipping email.");
            System.out.println("========================================\n");
            return;
        }

        try {
            if (mailSender == null) {
                System.out.println("❌ CRITICAL: Mail sender is NOT configured!");
                System.out.println("   Spring may not have initialized JavaMailSender bean");
                System.out.println("   Make sure spring.mail.* properties are configured");
                System.out.println("========================================\n");
                return;
            }

            System.out.println("✅ Mail sender is configured");
            System.out.println("Creating MIME message...");
            System.out.flush();
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom("FarmTech <" + fromEmail + ">");
            helper.setReplyTo(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            mimeMessage.setHeader("X-Mailer", "FarmTech Equipment Rental System v1.0");
            mimeMessage.setHeader("X-Priority", "3");
            mimeMessage.setHeader("X-Auto-Response-Suppress", "OOF, DR, RN, NRN, AutoReply");
            mimeMessage.setHeader("Precedence", "bulk");

            System.out.println("📤 About to send email via SMTP to: " + to);
            System.out.flush();
            mailSender.send(mimeMessage);
            System.out.println("✅ ✅ ✅ EMAIL SENT SUCCESSFULLY ✅ ✅ ✅");
            System.out.println("   Recipient: " + to);
            System.out.println("   Subject: " + subject);
            System.out.flush();
        } catch (Exception e) {
            System.err.println("❌ ❌ ❌ FAILED TO SEND EMAIL ❌ ❌ ❌");
            System.err.println("Recipient: " + to);
            System.err.println("Subject: " + subject);
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            System.err.println("Error Message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Root Cause: " + e.getCause().getClass().getSimpleName() + " - " + e.getCause().getMessage());
            }
            System.err.println("Stack trace:");
            e.printStackTrace();
            System.err.flush();
        }
        System.out.println("========================================\n");
        System.out.flush();
    }

    public void sendEmail(String to, String subject, String body) {
        System.out.println("📧 [EmailService] sendEmail() called");
        System.out.println("   To: " + to);
        System.out.println("   Subject: " + subject);
        System.out.println("   Email Enabled: " + emailEnabled);
        System.out.println("   From Email: " + fromEmail);
        System.out.println("   Mail Sender: " + (mailSender != null ? "Configured" : "NULL"));
        
        if (!emailEnabled) {
            System.out.println("⚠️ [EmailService] Email feature disabled. Would send to " + to);
            System.out.println("  Subject: " + subject);
            System.out.println("  Body: " + body);
            return;
        }

        if (to == null || to.isBlank()) {
            System.out.println("⚠️ [EmailService] Recipient email is empty. Skipping email.");
            return;
        }

        try {
            if (mailSender == null) {
                System.out.println("⚠️ [EmailService] Mail sender not configured. Would send to " + to);
                System.out.println("  Subject: " + subject);
                System.out.println("  Body: " + body);
                return;
            }

            System.out.println("📤 [EmailService] Creating and sending HTML email message...");
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom("FarmTech Notifications <" + fromEmail + ">");
            helper.setReplyTo(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            
            String htmlBody = convertToHtml(body);
            helper.setText(body, htmlBody);
            
            mimeMessage.setHeader("X-Mailer", "FarmTech Equipment Rental System v1.0");
            mimeMessage.setHeader("X-Priority", "3");
            mimeMessage.setHeader("Importance", "Normal");
            mimeMessage.setHeader("X-MSMail-Priority", "Normal");
            mimeMessage.setHeader("X-Auto-Response-Suppress", "OOF, DR, RN, NRN, AutoReply");
            mimeMessage.setHeader("Precedence", "bulk");
            mimeMessage.setHeader("X-Entity-Ref-ID", "FarmTech-" + System.currentTimeMillis());
            mimeMessage.setHeader("List-Unsubscribe", "<mailto:" + fromEmail + "?subject=unsubscribe>");
            mimeMessage.setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
            mimeMessage.setHeader("X-Content-Type-Options", "nosniff");
            mimeMessage.setHeader("X-Spam-Status", "No");
            mimeMessage.setHeader("X-Spam-Flag", "NO");

            mailSender.send(mimeMessage);
            System.out.println("✅ [EmailService] HTML email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("❌ [EmailService] Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendBookingConfirmationToBooker(String to, String bookerName, String equipmentName, 
                                                 String startDate, Integer hours, Long bookingId) {
        System.out.println("\n\n╔═══════════════════════════════════════════════════════════════╗");
        System.out.println("║  📧 sendBookingConfirmationToBooker() METHOD CALLED             ║");
        System.out.println("╚═══════════════════════════════════════════════════════════════╝");
        System.out.println("To (Recipient Email): " + to);
        System.out.println("Booker Name: " + bookerName);
        System.out.println("Equipment Name: " + equipmentName);
        System.out.println("Start Date: " + startDate);
        System.out.println("Hours: " + hours);
        System.out.println("Booking ID: " + bookingId);
        System.out.println("Email Service Enabled: " + emailEnabled);
        System.out.println("Mail Sender Initialized: " + (mailSender != null));
        
        System.out.println("\n✅ VALIDATION:");
        System.out.println("   to is null: " + (to == null));
        System.out.println("   to is blank: " + (to != null && to.isBlank()));
        System.out.println("   equipmentName is null: " + (equipmentName == null));
        System.out.println("   equipmentName is blank: " + (equipmentName != null && equipmentName.isBlank()));
        System.out.println("   startDate is null: " + (startDate == null));
        System.out.println("   startDate is blank: " + (startDate != null && startDate.isBlank()));
        System.out.println("   hours is null: " + (hours == null));
        System.out.flush();
        
        String subject = "Booking placed | Order #" + bookingId;
        
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "* { margin: 0; padding: 0; box-sizing: border-box; }" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f8f8; color: #1a1a1a; }" +
            ".wrapper { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }" +
            ".header { background: linear-gradient(135deg, #EE7752 0%%, #FF5722 100%%); color: white; padding: 25px 20px; text-align: center; }" +
            ".logo-text { font-size: 24px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.5px; }" +
            ".logo-subtext { font-size: 13px; opacity: 0.95; font-weight: 500; }" +
            ".greeting-section { background: #fff9f5; padding: 20px 25px; border-bottom: 1px solid #fce4d6; text-align: center; }" +
            ".greeting-text { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 8px; }" +
            ".greeting-link { color: #EE7752; text-decoration: none; font-weight: 600; }" +
            ".content { padding: 30px 25px; }" +
            ".status-message { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }" +
            ".status-subtext { font-size: 14px; color: #666; margin-bottom: 25px; }" +
            ".order-card { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
            ".order-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }" +
            ".order-label { color: #999; font-weight: 500; }" +
            ".order-value { color: #1a1a1a; font-weight: 600; }" +
            ".order-row:not(:last-child) { border-bottom: 1px solid #efefef; }" +
            ".order-number-highlight { background: white; border: 2px solid #EE7752; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }" +
            ".order-number-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }" +
            ".order-number { font-size: 28px; font-weight: 700; color: #EE7752; margin-top: 5px; font-family: 'Courier New', monospace; }" +
            ".next-steps { background: #f9f9f9; border-left: 4px solid #EE7752; padding: 20px; border-radius: 4px; margin: 25px 0; }" +
            ".next-steps-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }" +
            ".next-steps-list { font-size: 13px; color: #555; line-height: 1.8; }" +
            ".step-item { margin: 6px 0; }" +
            ".cta-button { display: inline-block; width: 100%%; background: linear-gradient(135deg, #EE7752 0%%, #FF5722 100%%); color: white; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0; box-sizing: border-box; transition: opacity 0.2s; }" +
            ".cta-button:hover { opacity: 0.95; }" +
            ".footer-section { background: #f9f9f9; padding: 20px 25px; border-top: 1px solid #e8e8e8; text-align: center; }" +
            ".footer-text { font-size: 12px; color: #999; line-height: 1.6; }" +
            ".footer-link { color: #EE7752; text-decoration: none; }" +
            ".divider { height: 1px; background: #e8e8e8; margin: 20px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='wrapper'>" +
            "<div class='header'>" +
            "<div class='logo-text'>🚜 FarmTech</div>" +
            "<div class='logo-subtext'>Equipment Rental Platform</div>" +
            "</div>" +
            "<div class='greeting-section'>" +
            "<div class='greeting-text'>Greetings from FarmTech</div>" +
            "<div class='greeting-text'>Your booking request has been placed! <a href='https://farmtech.app/bookings' class='greeting-link'>Rate your experience here</a></div>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='status-message'>Booking placed</div>" +
            "<div class='status-subtext'>We're searching for the perfect equipment owner for you</div>" +
            "<div class='order-number-highlight'>" +
            "<div class='order-number-label'>Order Number</div>" +
            "<div class='order-number'>#%s</div>" +
            "</div>" +
            "<div class='order-card'>" +
            "<div class='order-row'>" +
            "<span class='order-label'>Equipment</span>" +
            "<span class='order-value'>%s</span>" +
            "</div>" +
            "<div class='order-row'>" +
            "<span class='order-label'>Start Date</span>" +
            "<span class='order-value'>%s</span>" +
            "</div>" +
            "<div class='order-row'>" +
            "<span class='order-label'>Duration</span>" +
            "<span class='order-value'>%s hours</span>" +
            "</div>" +
            "</div>" +
            "<div class='next-steps'>" +
            "<div class='next-steps-title'>What happens next?</div>" +
            "<div class='next-steps-list'>" +
            "<div class='step-item'>✅ We'll notify nearby equipment owners</div>" +
            "<div class='step-item'>✅ Owners will review your booking</div>" +
            "<div class='step-item'>✅ You'll get notified when someone accepts</div>" +
            "<div class='step-item'>✅ Exchange details and finalize</div>" +
            "</div>" +
            "</div>" +
            "<a href='https://farmtech.app/bookings' class='cta-button'>View Your Booking</a>" +
            "<div class='next-steps'>" +
            "<div class='next-steps-title'>Need Help?</div>" +
            "<div class='next-steps-list'>" +
            "Contact us: <a href='mailto:support@farmtech.com' class='footer-link'>support@farmtech.com</a>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='footer-section'>" +
            "<div class='footer-text'>This is an automated message from FarmTech</div>" +
            "<div class='footer-text' style='margin-top: 8px;'>© 2024 FarmTech. All rights reserved.</div>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            bookingId, equipmentName, startDate, (hours != null ? hours : "N/A")
        );
        
        System.out.println("\n📬 Generated HTML email body");
        System.out.println("   Subject: " + subject);
        System.out.println("   Recipient: " + to);
        System.out.println("   HTML length: " + htmlBody.length() + " chars");
        System.out.println("   Booking ID in body: " + (htmlBody.contains(bookingId.toString()) ? "✅ YES" : "❌ NO"));
        System.out.println("   Equipment in body: " + (htmlBody.contains(equipmentName) ? "✅ YES" : "❌ NO"));
        System.out.println("   Start date in body: " + (htmlBody.contains(startDate) ? "✅ YES" : "❌ NO"));
        System.out.println("   Hours in body: " + (htmlBody.contains(String.valueOf(hours)) ? "✅ YES" : "❌ NO"));
        System.out.println("   Calling sendEmailHtml() now...");
        System.out.flush();
        
        sendEmailHtml(to, subject, htmlBody);
        
        System.out.println("✅ sendEmailHtml() completed for booking confirmation");
        System.out.flush();
    }

    public void sendBookingAcceptanceToBooker(String to, String bookerName, String equipmentName, 
                                               String ownerName, String ownerPhone, Long bookingId) {
        System.out.println("\n\n╔═══════════════════════════════════════════════════════════════╗");
        System.out.println("║  📧 sendBookingAcceptanceToBooker() CALLED                       ║");
        System.out.println("╚═══════════════════════════════════════════════════════════════╝");
        System.out.println("To (Booker Email): " + to);
        System.out.println("Booker Name: " + bookerName);
        System.out.println("Equipment Name: " + equipmentName);
        System.out.println("Owner Name (Accepter): " + ownerName);
        System.out.println("Owner Phone: " + ownerPhone);
        System.out.println("Booking ID: " + bookingId);
        System.out.flush();
        
        String subject = "Booking accepted | Order #" + bookingId;
        
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "* { margin: 0; padding: 0; box-sizing: border-box; }" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f8f8; color: #1a1a1a; }" +
            ".wrapper { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }" +
            ".header { background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); color: white; padding: 25px 20px; text-align: center; }" +
            ".logo-text { font-size: 24px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.5px; }" +
            ".logo-subtext { font-size: 13px; opacity: 0.95; font-weight: 500; }" +
            ".greeting-section { background: #f0fdf4; padding: 20px 25px; border-bottom: 1px solid #dcfce7; text-align: center; }" +
            ".greeting-text { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 8px; }" +
            ".greeting-link { color: #10B981; text-decoration: none; font-weight: 600; }" +
            ".content { padding: 30px 25px; }" +
            ".status-message { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }" +
            ".status-subtext { font-size: 14px; color: #666; margin-bottom: 25px; }" +
            ".owner-card { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
            ".owner-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }" +
            ".owner-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 15px; }" +
            ".contact-row { display: flex; align-items: center; margin: 8px 0; font-size: 14px; color: #555; }" +
            ".contact-icon { margin-right: 10px; font-size: 16px; }" +
            ".contact-value { font-weight: 600; color: #10B981; }" +
            ".equipment-card { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
            ".equipment-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }" +
            ".equipment-label { color: #999; font-weight: 500; }" +
            ".equipment-value { color: #1a1a1a; font-weight: 600; }" +
            ".equipment-row:not(:last-child) { border-bottom: 1px solid #efefef; }" +
            ".next-steps { background: #f9f9f9; border-left: 4px solid #10B981; padding: 20px; border-radius: 4px; margin: 25px 0; }" +
            ".next-steps-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }" +
            ".next-steps-list { font-size: 13px; color: #555; line-height: 1.8; }" +
            ".step-item { margin: 6px 0; }" +
            ".cta-button { display: inline-block; width: 100%%; background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); color: white; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0; box-sizing: border-box; transition: opacity 0.2s; }" +
            ".cta-button:hover { opacity: 0.95; }" +
            ".footer-section { background: #f9f9f9; padding: 20px 25px; border-top: 1px solid #e8e8e8; text-align: center; }" +
            ".footer-text { font-size: 12px; color: #999; line-height: 1.6; }" +
            ".footer-link { color: #10B981; text-decoration: none; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='wrapper'>" +
            "<div class='header'>" +
            "<div class='logo-text'>🚜 FarmTech</div>" +
            "<div class='logo-subtext'>Equipment Rental Platform</div>" +
            "</div>" +
            "<div class='greeting-section'>" +
            "<div class='greeting-text'>Greetings from FarmTech</div>" +
            "<div class='greeting-text'>Your booking has been accepted! <a href='https://farmtech.app/bookings' class='greeting-link'>Rate your experience here</a></div>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='status-message'>Booking accepted</div>" +
            "<div class='status-subtext'>Connect with your equipment owner now</div>" +
            "<div class='owner-card'>" +
            "<div class='owner-label'>Equipment Owner</div>" +
            "<div class='owner-name'>%s</div>" +
            "<div class='contact-row'>" +
            "<span class='contact-icon'>📞</span>" +
            "<span class='contact-value'>%s</span>" +
            "</div>" +
            "</div>" +
            "<div class='equipment-card'>" +
            "<div class='equipment-row'>" +
            "<span class='equipment-label'>Equipment</span>" +
            "<span class='equipment-value'>%s</span>" +
            "</div>" +
            "<div class='equipment-row'>" +
            "<span class='equipment-label'>Order Number</span>" +
            "<span class='equipment-value'>#%s</span>" +
            "</div>" +
            "</div>" +
            "<div class='next-steps'>" +
            "<div class='next-steps-title'>What to do next</div>" +
            "<div class='next-steps-list'>" +
            "<div class='step-item'>✅ Call or message the owner to confirm details</div>" +
            "<div class='step-item'>✅ Finalize pickup/delivery location and time</div>" +
            "<div class='step-item'>✅ Confirm payment arrangements</div>" +
            "<div class='step-item'>✅ Enjoy your rental!</div>" +
            "</div>" +
            "</div>" +
            "<a href='https://farmtech.app/bookings' class='cta-button'>View Booking Details</a>" +
            "<div class='next-steps'>" +
            "<div class='next-steps-title'>Need Help?</div>" +
            "<div class='next-steps-list'>" +
            "Contact support: <a href='mailto:support@farmtech.com' class='footer-link'>support@farmtech.com</a>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='footer-section'>" +
            "<div class='footer-text'>This is an automated message from FarmTech</div>" +
            "<div class='footer-text' style='margin-top: 8px;'>© 2024 FarmTech. All rights reserved.</div>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            ownerName, ownerPhone, equipmentName, bookingId
        );
        
        System.out.println("\n📬 Generated acceptance email HTML");
        System.out.println("   Subject: " + subject);
        System.out.println("   Recipient: " + to);
        System.out.println("   HTML length: " + htmlBody.length() + " chars");
        System.out.println("   Owner name in body: " + (htmlBody.contains(ownerName) ? "✅ YES" : "❌ NO"));
        System.out.println("   Owner phone in body: " + (htmlBody.contains(ownerPhone) ? "✅ YES" : "❌ NO"));
        System.out.println("   Equipment in body: " + (htmlBody.contains(equipmentName) ? "✅ YES" : "❌ NO"));
        System.out.println("   Booking ID in body: " + (htmlBody.contains(bookingId.toString()) ? "✅ YES" : "❌ NO"));
        System.out.println("   Calling sendEmailHtml() now...");
        System.out.flush();
        
        sendEmailHtml(to, subject, htmlBody);
        
        System.out.println("✅ sendEmailHtml() completed for booking acceptance");
        System.out.flush();
    }

    public void sendBookingAcceptanceToOwner(String to, String ownerName, String equipmentName, 
                                              String bookerName, String bookerPhone, String bookerEmail,
                                              String location, String startDate, Integer hours, Long bookingId) {
        String subject = "New rental request | Order #" + bookingId;
        
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "* { margin: 0; padding: 0; box-sizing: border-box; }" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f8f8; color: #1a1a1a; }" +
            ".wrapper { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }" +
            ".header { background: linear-gradient(135deg, #8B5CF6 0%%, #7C3AED 100%%); color: white; padding: 25px 20px; text-align: center; }" +
            ".logo-text { font-size: 24px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.5px; }" +
            ".logo-subtext { font-size: 13px; opacity: 0.95; font-weight: 500; }" +
            ".greeting-section { background: #faf5ff; padding: 20px 25px; border-bottom: 1px solid #f3e8ff; text-align: center; }" +
            ".greeting-text { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 8px; }" +
            ".greeting-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }" +
            ".content { padding: 30px 25px; }" +
            ".status-message { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }" +
            ".status-subtext { font-size: 14px; color: #666; margin-bottom: 25px; }" +
            ".earning-banner { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%%, rgba(124, 58, 237, 0.08) 100%%); border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }" +
            ".earning-value { font-size: 28px; font-weight: 700; color: #8B5CF6; margin-bottom: 5px; }" +
            ".earning-text { font-size: 13px; color: #666; }" +
            ".renter-card { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
            ".renter-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }" +
            ".renter-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 15px; }" +
            ".contact-row { display: flex; align-items: center; margin: 8px 0; font-size: 14px; color: #555; }" +
            ".contact-icon { margin-right: 10px; font-size: 16px; }" +
            ".contact-value { font-weight: 600; color: #8B5CF6; }" +
            ".equipment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }" +
            ".equipment-box { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 15px; }" +
            ".equipment-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }" +
            ".equipment-value { font-size: 16px; font-weight: 700; color: #1a1a1a; }" +
            ".action-items { background: #f9f9f9; border-left: 4px solid #8B5CF6; padding: 20px; border-radius: 4px; margin: 25px 0; }" +
            ".action-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }" +
            ".action-list { font-size: 13px; color: #555; line-height: 1.8; }" +
            ".action-item { margin: 6px 0; }" +
            ".cta-button { display: inline-block; width: 100%%; background: linear-gradient(135deg, #8B5CF6 0%%, #7C3AED 100%%); color: white; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0; box-sizing: border-box; transition: opacity 0.2s; }" +
            ".cta-button:hover { opacity: 0.95; }" +
            ".footer-section { background: #f9f9f9; padding: 20px 25px; border-top: 1px solid #e8e8e8; text-align: center; }" +
            ".footer-text { font-size: 12px; color: #999; line-height: 1.6; }" +
            ".footer-link { color: #8B5CF6; text-decoration: none; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='wrapper'>" +
            "<div class='header'>" +
            "<div class='logo-text'>🚜 FarmTech</div>" +
            "<div class='logo-subtext'>Equipment Rental Platform</div>" +
            "</div>" +
            "<div class='greeting-section'>" +
            "<div class='greeting-text'>Greetings from FarmTech</div>" +
            "<div class='greeting-text'>You have a new rental request! <a href='https://farmtech.app/owner-requests' class='greeting-link'>Rate your experience here</a></div>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='status-message'>New rental income! 💰</div>" +
            "<div class='status-subtext'>Someone wants to rent your equipment</div>" +
            "<div class='earning-banner'>" +
            "<div class='earning-value'>%s Hours</div>" +
            "<div class='earning-text'>Rental period available</div>" +
            "</div>" +
            "<div class='renter-card'>" +
            "<div class='renter-label'>Renter Information</div>" +
            "<div class='renter-name'>%s</div>" +
            "<div class='contact-row'>" +
            "<span class='contact-icon'>📞</span>" +
            "<span class='contact-value'>%s</span>" +
            "</div>" +
            "<div class='contact-row'>" +
            "<span class='contact-icon'>📧</span>" +
            "<span>%s</span>" +
            "</div>" +
            "</div>" +
            "<div class='equipment-grid'>" +
            "<div class='equipment-box'>" +
            "<div class='equipment-label'>Equipment</div>" +
            "<div class='equipment-value'>%s</div>" +
            "</div>" +
            "<div class='equipment-box'>" +
            "<div class='equipment-label'>Start Date</div>" +
            "<div class='equipment-value'>%s</div>" +
            "</div>" +
            "<div class='equipment-box'>" +
            "<div class='equipment-label'>Duration</div>" +
            "<div class='equipment-value'>%s hours</div>" +
            "</div>" +
            "<div class='equipment-box'>" +
            "<div class='equipment-label'>Location</div>" +
            "<div class='equipment-value'>%s</div>" +
            "</div>" +
            "</div>" +
            "<div class='action-items'>" +
            "<div class='action-title'>Your Action Items</div>" +
            "<div class='action-list'>" +
            "<div class='action-item'>1. Contact renter to confirm details</div>" +
            "<div class='action-item'>2. Discuss pickup/delivery arrangements</div>" +
            "<div class='action-item'>3. Confirm payment and rental terms</div>" +
            "<div class='action-item'>4. Complete the rental</div>" +
            "</div>" +
            "</div>" +
            "<a href='https://farmtech.app/owner-requests' class='cta-button'>View Full Details</a>" +
            "<div class='action-items'>" +
            "<div class='action-title'>Need Support?</div>" +
            "<div class='action-list'>" +
            "Contact us: <a href='mailto:support@farmtech.com' class='footer-link'>support@farmtech.com</a>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='footer-section'>" +
            "<div class='footer-text'>This is an automated message from FarmTech</div>" +
            "<div class='footer-text' style='margin-top: 8px;'>© 2024 FarmTech. All rights reserved.</div>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            (hours != null ? hours : "N/A"), bookerName, bookerPhone, bookerEmail, equipmentName,
            startDate, (hours != null ? hours : "N/A"),
            (location != null && !location.isBlank() ? location : "To be confirmed")
        );
        
        sendEmailHtml(to, subject, htmlBody);
    }

    public void sendBookingRequestToOwner(String to, String ownerName, String equipmentName, 
                                          String bookerName, String bookerPhone, String bookerEmail,
                                          String location, String startDate, Integer hours, Long bookingId) {
        String subject = "New booking request | Order #" + bookingId;
        
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "* { margin: 0; padding: 0; box-sizing: border-box; }" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f8f8; color: #1a1a1a; }" +
            ".wrapper { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }" +
            ".header { background: linear-gradient(135deg, #8B5CF6 0%%, #7C3AED 100%%); color: white; padding: 25px 20px; text-align: center; }" +
            ".logo-text { font-size: 24px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.5px; }" +
            ".logo-subtext { font-size: 13px; opacity: 0.95; font-weight: 500; }" +
            ".greeting-section { background: #faf5ff; padding: 20px 25px; border-bottom: 1px solid #f3e8ff; text-align: center; }" +
            ".greeting-text { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 8px; }" +
            ".greeting-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }" +
            ".content { padding: 30px 25px; }" +
            ".status-message { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }" +
            ".status-subtext { font-size: 14px; color: #666; margin-bottom: 25px; }" +
            ".alert-banner { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%%, rgba(124, 58, 237, 0.08) 100%%); border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }" +
            ".alert-value { font-size: 28px; font-weight: 700; color: #8B5CF6; margin-bottom: 5px; }" +
            ".alert-text { font-size: 13px; color: #666; }" +
            ".booker-card { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
            ".booker-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }" +
            ".booker-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 15px; }" +
            ".contact-row { display: flex; align-items: center; margin: 8px 0; font-size: 14px; color: #555; }" +
            ".contact-icon { margin-right: 10px; font-size: 16px; }" +
            ".contact-value { font-weight: 600; color: #8B5CF6; }" +
            ".details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }" +
            ".details-box { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 8px; padding: 15px; }" +
            ".details-label { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }" +
            ".details-value { font-size: 16px; font-weight: 700; color: #1a1a1a; }" +
            ".action-items { background: #f9f9f9; border-left: 4px solid #8B5CF6; padding: 20px; border-radius: 4px; margin: 25px 0; }" +
            ".action-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }" +
            ".action-list { font-size: 13px; color: #555; line-height: 1.8; }" +
            ".action-item { margin: 6px 0; }" +
            ".cta-button { display: inline-block; width: 100%%; background: linear-gradient(135deg, #8B5CF6 0%%, #7C3AED 100%%); color: white; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0; box-sizing: border-box; transition: opacity 0.2s; }" +
            ".cta-button:hover { opacity: 0.95; }" +
            ".footer-section { background: #f9f9f9; padding: 20px 25px; border-top: 1px solid #e8e8e8; text-align: center; }" +
            ".footer-text { font-size: 12px; color: #999; line-height: 1.6; }" +
            ".footer-link { color: #8B5CF6; text-decoration: none; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='wrapper'>" +
            "<div class='header'>" +
            "<div class='logo-text'>🚜 FarmTech</div>" +
            "<div class='logo-subtext'>Equipment Rental Platform</div>" +
            "</div>" +
            "<div class='greeting-section'>" +
            "<div class='greeting-text'>Greetings from FarmTech</div>" +
            "<div class='greeting-text'>Someone wants to rent your equipment! <a href='https://farmtech.app/owner-bookings' class='greeting-link'>Review requests here</a></div>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='status-message'>New booking request received</div>" +
            "<div class='status-subtext'>Someone is interested in renting your equipment</div>" +
            "<div class='alert-banner'>" +
            "<div class='alert-value'>📋 Order #%s</div>" +
            "<div class='alert-text'>New rental request waiting for your approval</div>" +
            "</div>" +
            "<div class='booker-card'>" +
            "<div class='booker-label'>Interested Renter</div>" +
            "<div class='booker-name'>%s</div>" +
            "<div class='contact-row'>" +
            "<span class='contact-icon'>📞</span>" +
            "<span class='contact-value'>%s</span>" +
            "</div>" +
            "<div class='contact-row'>" +
            "<span class='contact-icon'>📧</span>" +
            "<span>%s</span>" +
            "</div>" +
            "</div>" +
            "<div class='details-grid'>" +
            "<div class='details-box'>" +
            "<div class='details-label'>Equipment</div>" +
            "<div class='details-value'>%s</div>" +
            "</div>" +
            "<div class='details-box'>" +
            "<div class='details-label'>Start Date</div>" +
            "<div class='details-value'>%s</div>" +
            "</div>" +
            "<div class='details-box'>" +
            "<div class='details-label'>Duration</div>" +
            "<div class='details-value'>%s hours</div>" +
            "</div>" +
            "<div class='details-box'>" +
            "<div class='details-label'>Location</div>" +
            "<div class='details-value'>%s</div>" +
            "</div>" +
            "</div>" +
            "<div class='action-items'>" +
            "<div class='action-title'>Next Steps</div>" +
            "<div class='action-list'>" +
            "<div class='action-item'>✅ Review the booking details</div>" +
            "<div class='action-item'>✅ Contact the renter to confirm availability</div>" +
            "<div class='action-item'>✅ Accept or decline the booking request</div>" +
            "<div class='action-item'>✅ Arrange pickup/delivery and payment</div>" +
            "</div>" +
            "</div>" +
            "<a href='https://farmtech.app/owner-bookings' class='cta-button'>Review Request Now</a>" +
            "<div class='action-items'>" +
            "<div class='action-title'>Need Help?</div>" +
            "<div class='action-list'>" +
            "Contact us: <a href='mailto:support@farmtech.com' class='footer-link'>support@farmtech.com</a>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='footer-section'>" +
            "<div class='footer-text'>This is an automated message from FarmTech</div>" +
            "<div class='footer-text' style='margin-top: 8px;'>© 2024 FarmTech. All rights reserved.</div>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            bookingId, bookerName, bookerPhone, bookerEmail, equipmentName,
            startDate, (hours != null ? hours : "N/A"),
            (location != null && !location.isBlank() ? location : "To be confirmed")
        );
        
        sendEmailHtml(to, subject, htmlBody);
    }
    
    private String convertToHtml(String plainText) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
        html.append("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>");
        html.append("<style>body { font-family: Arial, sans-serif; }</style></head><body>");
        
        if (plainText != null) {
            String[] lines = plainText.split("\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    html.append("<p></p>");
                } else {
                    html.append("<p>").append(line).append("</p>");
                }
            }
        }
        
        html.append("</body></html>");
        return html.toString();
    }
}
