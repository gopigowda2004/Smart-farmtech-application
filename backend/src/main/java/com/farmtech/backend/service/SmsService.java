package com.farmtech.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// If Twilio SDK is not present yet, this service will no-op (log only).
@Service
public class SmsService {

    @Value("${twilio.accountSid:}")
    private String accountSid;

    @Value("${twilio.authToken:}")
    private String authToken;

    @Value("${twilio.fromNumber:+10000000000}")
    private String fromNumber;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    public void sendSms(String to, String message) {
        if (!smsEnabled) {
            // Feature disabled: do nothing
            return;
        }
        try {
            if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()) {
                System.out.println("[SmsService] Twilio not configured. Would send to " + to + ": " + message);
                return;
            }
            // Use reflection to avoid compile-time dependency when Twilio lib is not present yet
            Class<?> twilioClass = Class.forName("com.twilio.Twilio");
            twilioClass.getMethod("init", String.class, String.class).invoke(null, accountSid, authToken);

            Class<?> phoneNumberClass = Class.forName("com.twilio.type.PhoneNumber");
            Object toNumber = phoneNumberClass.getConstructor(String.class).newInstance(to);
            Object fromNum = phoneNumberClass.getConstructor(String.class).newInstance(fromNumber);

            Class<?> messageClass = Class.forName("com.twilio.rest.api.v2010.account.Message");
            Object creator = messageClass
                    .getMethod("creator", phoneNumberClass, phoneNumberClass, String.class)
                    .invoke(null, toNumber, fromNum, message);
            creator.getClass().getMethod("create").invoke(creator);
        } catch (ClassNotFoundException e) {
            System.out.println("[SmsService] Twilio library missing. Would send to " + to + ": " + message);
        } catch (Throwable t) {
            System.err.println("[SmsService] Failed to send SMS: " + t.getMessage());
        }
    }
}