package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Farmer;
import com.farmtech.backend.entity.User;
import com.farmtech.backend.repository.FarmerRepository;
import com.farmtech.backend.repository.UserRepository;
import com.farmtech.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Register User (Admin, Renter, Owner)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String phone = (String) request.get("phone");
        String password = (String) request.get("password");
        String name = (String) request.get("name");
        String role = (String) request.get("role"); // ADMIN, RENTER, OWNER
        
        System.out.println("📝 [AuthController] Registration attempt:");
        System.out.println("   Email: " + email);
        System.out.println("   Phone: " + phone);
        System.out.println("   Name: " + name);
        System.out.println("   Role: " + role);
        
        // Validate required fields
        if (email == null || email.isBlank() || phone == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email (required), phone, password, and name are required"));
        }
        
        // Set default role if not provided
        if (role == null) {
            role = "RENTER";
        }
        
        // Check if user already exists
        if (userRepository.findByPhone(phone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone already registered"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        
        // Create User record
        User user = new User();
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(password);
        user.setName(name);
        user.setFullName((String) request.get("fullName"));
        user.setGender((String) request.get("gender"));
        user.setAddress((String) request.get("address"));
        user.setDistrict((String) request.get("district"));
        user.setState((String) request.get("state"));
        user.setPincode((String) request.get("pincode"));
        user.setFarmSize((String) request.get("farmSize"));
        user.setCropType((String) request.get("cropType"));
        user.setExperience((String) request.get("experience"));
        user.setEquipmentOwned((String) request.get("equipmentOwned"));
        user.setRole(role);
        
        User savedUser = userRepository.save(user);
        System.out.println("✅ [AuthController] User saved with ID: " + savedUser.getId() + ", Email: " + savedUser.getEmail());
        
        // For OWNER role, also create a Farmer record (for equipment ownership)
        Long farmerId = null;
        if ("OWNER".equals(role) || "ADMIN".equals(role)) {
            // Check if farmer already exists
            Optional<Farmer> existingFarmer = farmerRepository.findByPhone(phone);
            if (existingFarmer.isPresent()) {
                farmerId = existingFarmer.get().getId();
                System.out.println("✅ Found existing Farmer ID: " + farmerId + " for OWNER registration");
            } else {
                Farmer farmer = new Farmer();
                farmer.setName(name);
                farmer.setEmail(email);
                farmer.setPhone(phone);
                farmer.setPassword(password);
                farmer.setAddress((String) request.get("address"));
                // Initialize coordinates to 0.0 so they can be updated later via profile
                farmer.setLatitude(0.0);
                farmer.setLongitude(0.0);
                
                Farmer savedFarmer = farmerRepository.save(farmer);
                farmerId = savedFarmer.getId();
                System.out.println("✅ Created new Farmer ID: " + farmerId + " for OWNER registration");
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("userId", savedUser.getId());
        response.put("role", role);
        if (farmerId != null) {
            response.put("farmerId", farmerId);
        }
        
        return ResponseEntity.ok(response);
    }
    
    // ✅ Register Farmer (Legacy endpoint for backward compatibility)
    @PostMapping("/register-farmer")
    public ResponseEntity<?> registerFarmer(@RequestBody Farmer farmer) {
        if (farmer.getEmail() == null || farmer.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (farmerRepository.findByPhone(farmer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone already registered"));
        }
        if (farmerRepository.findByEmail(farmer.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        Farmer savedFarmer = farmerRepository.save(farmer);
        return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "farmerId", savedFarmer.getId()
        ));
    }

    // ✅ Login (phone + password) - Enhanced with User role checking
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");

        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone is required"));
        }

        Optional<User> userOpt = userRepository.findByPhone(phone);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();
        String requestedRole = request.get("role");
        boolean isAdminUser = user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN");
        boolean adminPasswordLoginRequested = requestedRole != null && requestedRole.equalsIgnoreCase("ADMIN");

        if (!adminPasswordLoginRequested && isAdminUser) {
            // Fallback: if frontend forgot to send role but password present, honor password flow for admins
            adminPasswordLoginRequested = request.get("password") != null;
        }

        if (adminPasswordLoginRequested) {
            if (!isAdminUser) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied for non-admin user"));
            }

            String password = request.get("password");
            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required for admin login"));
            }

            if (user.getPassword() == null || !user.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid admin credentials"));
            }

            userRepository.clearOtpForUser(user.getId());
            return createUserLoginResponse(user);
        }

        String otp = request.get("otp");

        // If OTP provided -> verify OTP flow
        if (otp != null && !otp.isBlank()) {
            return handleOtpVerification(user, otp);
        }

        // Generate OTP and send email
        return handleOtpGeneration(user);
    }

    private ResponseEntity<?> handleOtpGeneration(User user) {
        String otp = generateOtp();
        Instant expiry = Instant.now().plusSeconds(5 * 60); // 5 minutes validity

        userRepository.updateOtpForUser(user.getId(), otp, expiry);

        emailService.sendOtpEmail(user.getEmail(), otp);

        Map<String, Object> maskedEmail = maskEmail(user.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent to your registered email");
        response.put("emailPrefix", maskedEmail.get("prefix"));
        response.put("maskedDomain", maskedEmail.get("maskedDomain"));
        response.put("otpSent", true);
        response.put("userId", user.getId());

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> handleOtpVerification(User user, String otp) {
        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No active OTP. Please request a new one."));
        }

        if (!user.getOtp().equals(otp)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid OTP"));
        }

        if (user.getOtpExpiry().isBefore(Instant.now())) {
            return ResponseEntity.status(401).body(Map.of("message", "OTP expired. Please request a new one."));
        }

        userRepository.clearOtpForUser(user.getId());

        Optional<User> refreshedUser = userRepository.findById(user.getId());
        if (refreshedUser.isEmpty()) {
            return ResponseEntity.status(500).body(Map.of("message", "User record missing after OTP verification"));
        }

        return createUserLoginResponse(refreshedUser.get());
    }

    private Map<String, Object> maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return Map.of("prefix", "user", "maskedDomain", "****");
        }

        String[] parts = email.split("@", 2);
        String prefix = parts[0];
        String domain = parts[1];

        // Show first 4 characters of email, mask the rest of the prefix
        String visiblePrefix = prefix.length() <= 4 ? prefix : prefix.substring(0, 4);
        String maskedPrefix = visiblePrefix + "****";

        // Mask domain except first character and TLD
        String maskedDomain;
        int lastDotIndex = domain.lastIndexOf('.');
        if (lastDotIndex > 1) {
            String domainName = domain.substring(0, lastDotIndex);
            String tld = domain.substring(lastDotIndex);
            String visibleDomainChar = domainName.substring(0, 1);
            maskedDomain = visibleDomainChar + "****" + tld;
        } else {
            maskedDomain = "****";
        }

        return Map.of("prefix", maskedPrefix, "maskedDomain", maskedDomain);
    }

    private String generateOtp() {
        int otp = ThreadLocalRandom.current().nextInt(100000, 999999);
        return String.valueOf(otp);
    }

    private ResponseEntity<?> createUserLoginResponse(User user) {
        Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
        Long farmerId = null;
        String farmerAddress = user.getAddress();

        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            farmerId = farmer.getId();
            if (farmer.getAddress() != null) {
                farmerAddress = farmer.getAddress();
            }
            System.out.println("✅ Login: Found Farmer ID " + farmerId + " for user " + user.getName());
        } else if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
            System.out.println("⚠️ Login: OWNER/ADMIN user has no Farmer record, creating one...");
            Farmer newFarmer = new Farmer();
            newFarmer.setName(user.getName());
            newFarmer.setEmail(user.getEmail());
            newFarmer.setPhone(user.getPhone());
            newFarmer.setPassword(user.getPassword());
            newFarmer.setAddress(user.getAddress());
            newFarmer.setLatitude(0.0);
            newFarmer.setLongitude(0.0);

            Farmer savedFarmer = farmerRepository.save(newFarmer);
            farmerId = savedFarmer.getId();
            System.out.println("✅ Login: Created Farmer ID " + farmerId + " for OWNER user " + user.getName());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("userId", user.getId());
        response.put("farmerId", farmerId);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("address", farmerAddress);
        response.put("role", user.getRole() != null ? user.getRole() : "USER");
        response.put("isAdmin", "ADMIN".equals(user.getRole()));

        System.out.println("✅ Login response: userId=" + user.getId() + ", farmerId=" + farmerId + ", role=" + user.getRole());

        return ResponseEntity.ok(response);
    }
}
