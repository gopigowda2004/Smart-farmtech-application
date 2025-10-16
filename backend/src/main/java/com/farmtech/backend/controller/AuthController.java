package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Farmer;
import com.farmtech.backend.entity.User;
import com.farmtech.backend.repository.FarmerRepository;
import com.farmtech.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Register User (Admin, Renter, Owner)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String phone = (String) request.get("phone");
        String password = (String) request.get("password");
        String name = (String) request.get("name");
        String role = (String) request.get("role"); // ADMIN, RENTER, OWNER
        
        // Validate required fields
        if (email == null || phone == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email, phone, password, and name are required"));
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
        if (farmerRepository.findByPhone(farmer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone already registered"));
        }
        if (farmer.getEmail() != null && farmerRepository.findByEmail(farmer.getEmail()).isPresent()) {
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
        String password = request.get("password");

        // First, try to authenticate using the User table (new registration system)
        Optional<User> userOpt = userRepository.findByPhone(phone);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            
            // Check if there's a corresponding Farmer record for equipment ownership
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(phone);
            Long farmerId = null;
            String farmerAddress = user.getAddress();
            
            if (farmerOpt.isPresent()) {
                farmerId = farmerOpt.get().getId();
                // Use farmer address if available, otherwise use user address
                if (farmerOpt.get().getAddress() != null) {
                    farmerAddress = farmerOpt.get().getAddress();
                }
                System.out.println("✅ Login: Found Farmer ID " + farmerId + " for user " + user.getName());
            } else if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
                // Auto-create Farmer record for OWNER/ADMIN users who don't have one
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
        
        // Fallback: try to authenticate using the Farmer table (legacy system)
        Optional<Farmer> farmerOpt = farmerRepository.findByPhone(phone);

        if (farmerOpt.isPresent() && farmerOpt.get().getPassword().equals(password)) {
            Farmer farmer = farmerOpt.get();
            
            // For legacy farmers, default role is USER
            String userRole = "USER";
            Long userId = null;
            
            // Check if there's a corresponding User record
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                userRole = user.getRole() != null ? user.getRole() : "USER";
                userId = user.getId();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("farmerId", farmer.getId());
            response.put("userId", userId);
            response.put("name", farmer.getName());
            response.put("email", farmer.getEmail());
            response.put("phone", farmer.getPhone());
            response.put("address", farmer.getAddress());
            response.put("role", userRole);
            response.put("isAdmin", "ADMIN".equals(userRole));
            
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }
}
