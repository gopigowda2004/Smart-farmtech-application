package com.farmtech.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@farmtech.com}")
    private String fromEmail;

    @Value("${email.enabled:false}")
    private boolean emailEnabled;

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
            
            // Use MimeMessage for better email formatting and headers
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            // Set sender with professional name
            helper.setFrom("FarmTech Notifications <" + fromEmail + ">");
            helper.setReplyTo(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            
            // Convert plain text to HTML with proper formatting
            String htmlBody = convertToHtml(body);
            helper.setText(body, htmlBody);  // Set both plain text and HTML versions
            
            // Add comprehensive headers to improve deliverability and avoid spam filters
            mimeMessage.setHeader("X-Mailer", "FarmTech Equipment Rental System v1.0");
            mimeMessage.setHeader("X-Priority", "3");  // Normal priority (1=High, 3=Normal, 5=Low)
            mimeMessage.setHeader("Importance", "Normal");
            mimeMessage.setHeader("X-MSMail-Priority", "Normal");
            
            // Transactional email headers
            mimeMessage.setHeader("X-Auto-Response-Suppress", "OOF, DR, RN, NRN, AutoReply");
            mimeMessage.setHeader("Precedence", "bulk");
            mimeMessage.setHeader("X-Entity-Ref-ID", "FarmTech-" + System.currentTimeMillis());
            
            // List management headers (required for commercial emails)
            mimeMessage.setHeader("List-Unsubscribe", "<mailto:" + fromEmail + "?subject=unsubscribe>");
            mimeMessage.setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
            
            // Content type headers
            mimeMessage.setHeader("X-Content-Type-Options", "nosniff");
            
            // Authentication and security headers
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
        String subject = "Booking Confirmation - FarmTech Order #" + bookingId;
        String body = String.format(
            "Dear %s,\n\n" +
            "Thank you for your booking request on FarmTech Equipment Rental Platform.\n\n" +
            "Your booking has been successfully submitted and is now being processed.\n\n" +
            "BOOKING DETAILS\n" +
            "----------------------------------------\n" +
            "Booking Reference: #%s\n" +
            "Equipment Name: %s\n" +
            "Start Date: %s\n" +
            "Duration: %s hours\n" +
            "Current Status: PENDING\n\n" +
            "NEXT STEPS\n" +
            "----------------------------------------\n" +
            "Your booking request is being matched with available equipment owners.\n" +
            "You will receive a confirmation email once an owner accepts your request.\n\n" +
            "NEED HELP?\n" +
            "----------------------------------------\n" +
            "If you have questions about your booking, please contact our support team.\n\n" +
            "Thank you for choosing FarmTech.\n\n" +
            "Regards,\n" +
            "FarmTech Support Team\n" +
            "Equipment Rental Platform\n\n" +
            "----------------------------------------\n" +
            "This is an automated notification from FarmTech.\n" +
            "This email was sent to: %s",
            bookerName, bookingId, equipmentName, startDate, 
            (hours != null ? hours : "N/A"), to
        );
        
        sendEmail(to, subject, body);
    }

    public void sendBookingAcceptanceToBooker(String to, String bookerName, String equipmentName, 
                                               String ownerName, String ownerPhone, Long bookingId) {
        String subject = "Booking Confirmed - FarmTech Order #" + bookingId;
        String body = String.format(
            "Dear %s,\n\n" +
            "Good news! Your booking request has been accepted by an equipment owner.\n\n" +
            "BOOKING DETAILS\n" +
            "----------------------------------------\n" +
            "Booking Reference: #%s\n" +
            "Equipment Name: %s\n" +
            "Current Status: CONFIRMED\n\n" +
            "OWNER CONTACT INFORMATION\n" +
            "----------------------------------------\n" +
            "Owner Name: %s\n" +
            "Phone Number: %s\n\n" +
            "NEXT STEPS\n" +
            "----------------------------------------\n" +
            "Please contact the owner to:\n" +
            "- Confirm pickup/delivery time and location\n" +
            "- Discuss any specific requirements\n" +
            "- Finalize payment arrangements\n\n" +
            "NEED HELP?\n" +
            "----------------------------------------\n" +
            "If you have questions, please contact our support team.\n\n" +
            "Thank you for choosing FarmTech.\n\n" +
            "Regards,\n" +
            "FarmTech Support Team\n" +
            "Equipment Rental Platform\n\n" +
            "----------------------------------------\n" +
            "This is an automated notification from FarmTech.\n" +
            "This email was sent to: %s",
            bookerName, bookingId, equipmentName, ownerName, ownerPhone, to
        );
        
        sendEmail(to, subject, body);
    }

    public void sendBookingAcceptanceToOwner(String to, String ownerName, String equipmentName, 
                                              String bookerName, String bookerPhone, String bookerEmail,
                                              String location, String startDate, Integer hours, Long bookingId) {
        String subject = "Booking Accepted - Renter Details for Order #" + bookingId;
        String body = String.format(
            "Dear %s,\n\n" +
            "Thank you for accepting the booking request. Here are the renter details.\n\n" +
            "BOOKING DETAILS\n" +
            "----------------------------------------\n" +
            "Booking Reference: #%s\n" +
            "Equipment Name: %s\n" +
            "Start Date: %s\n" +
            "Duration: %s hours\n" +
            "Location: %s\n\n" +
            "RENTER CONTACT INFORMATION\n" +
            "----------------------------------------\n" +
            "Name: %s\n" +
            "Phone: %s\n" +
            "Email: %s\n\n" +
            "NEXT STEPS\n" +
            "----------------------------------------\n" +
            "Please contact the renter to:\n" +
            "- Confirm pickup/delivery time and location\n" +
            "- Discuss equipment operation and safety guidelines\n" +
            "- Finalize payment and rental terms\n\n" +
            "NEED HELP?\n" +
            "----------------------------------------\n" +
            "If you have questions, please contact our support team.\n\n" +
            "Thank you for being part of FarmTech.\n\n" +
            "Regards,\n" +
            "FarmTech Support Team\n" +
            "Equipment Rental Platform\n\n" +
            "----------------------------------------\n" +
            "This is an automated notification from FarmTech.\n" +
            "This email was sent to: %s",
            ownerName, bookingId, equipmentName, startDate, 
            (hours != null ? hours : "N/A"), 
            (location != null && !location.isBlank() ? location : "Not specified"),
            bookerName, bookerPhone, bookerEmail, to
        );
        
        sendEmail(to, subject, body);
    }
    
    /**
     * Convert plain text email to HTML format for better deliverability
     * Uses professional email template with anti-spam best practices
     */
    private String convertToHtml(String plainText) {
        StringBuilder html = new StringBuilder();
        
        // Professional HTML email template with proper DOCTYPE
        html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
        html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
        html.append("<head>");
        html.append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>");
        html.append("<title>FarmTech Notification</title>");
        html.append("<style type=\"text/css\">");
        html.append("body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }");
        html.append("table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }");
        html.append("img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }");
        html.append(".wrapper { width: 100%; background-color: #f4f4f4; padding: 20px 0; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }");
        html.append(".header { background-color: #2c5f2d; color: #ffffff; padding: 20px; text-align: center; }");
        html.append(".content { padding: 30px; color: #333333; line-height: 1.6; }");
        html.append(".section { background-color: #f9f9f9; border-left: 4px solid #4a7c4e; padding: 15px; margin: 20px 0; }");
        html.append(".section-title { color: #2c5f2d; font-size: 16px; font-weight: bold; margin: 0 0 10px 0; }");
        html.append(".info-row { padding: 5px 0; }");
        html.append(".footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666666; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body style=\"margin: 0; padding: 0;\">");
        
        // Wrapper table for email client compatibility
        html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"wrapper\">");
        html.append("<tr><td align=\"center\">");
        
        // Main container
        html.append("<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"container\">");
        
        // Header
        html.append("<tr><td class=\"header\">");
        html.append("<h1 style=\"margin: 0; font-size: 24px; font-weight: normal;\">FarmTech</h1>");
        html.append("<p style=\"margin: 5px 0 0 0; font-size: 14px;\">Equipment Rental Platform</p>");
        html.append("</td></tr>");
        
        // Content
        html.append("<tr><td class=\"content\">");
        
        // Parse plain text content
        String[] lines = plainText.split("\n");
        boolean inSection = false;
        String currentSectionTitle = "";
        
        for (String line : lines) {
            line = line.trim();
            
            if (line.isEmpty()) {
                if (inSection) {
                    html.append("</div>");
                    inSection = false;
                }
                continue;
            }
            
            // Skip separator lines
            if (line.contains("----------------------------------------")) {
                continue;
            }
            
            // Detect section headers (all caps)
            if (line.matches("^[A-Z][A-Z ]+$") && line.length() > 5) {
                if (inSection) {
                    html.append("</div>");
                }
                currentSectionTitle = line;
                html.append("<div class=\"section\">");
                html.append("<div class=\"section-title\">").append(line).append("</div>");
                inSection = true;
            }
            // Footer detection
            else if (line.startsWith("This is an automated") || line.startsWith("This email was sent to:")) {
                if (inSection) {
                    html.append("</div>");
                    inSection = false;
                }
                // Footer will be added separately
            }
            // Regular content
            else {
                String escapedLine = line.replace("<", "&lt;").replace(">", "&gt;");
                
                // Check if it's a key-value pair (contains colon)
                if (escapedLine.contains(":") && !escapedLine.endsWith(":")) {
                    html.append("<div class=\"info-row\"><strong>");
                    String[] parts = escapedLine.split(":", 2);
                    html.append(parts[0]).append(":</strong> ");
                    if (parts.length > 1) {
                        html.append(parts[1].trim());
                    }
                    html.append("</div>");
                } else {
                    html.append("<p style=\"margin: 10px 0;\">").append(escapedLine).append("</p>");
                }
            }
        }
        
        if (inSection) {
            html.append("</div>");
        }
        
        html.append("</td></tr>");
        
        // Footer
        html.append("<tr><td class=\"footer\">");
        html.append("<p style=\"margin: 0 0 10px 0;\">This is an automated notification from FarmTech Equipment Rental Platform.</p>");
        html.append("<p style=\"margin: 0;\">© 2024 FarmTech. All rights reserved.</p>");
        html.append("</td></tr>");
        
        html.append("</table>");
        html.append("</td></tr></table>");
        
        html.append("</body></html>");
        return html.toString();
    }
}