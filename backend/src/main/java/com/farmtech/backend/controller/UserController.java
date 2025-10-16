package com.farmtech.backend.controller;

import com.farmtech.backend.entity.User;
import com.farmtech.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // Removed check-aadhar endpoint as Aadhar is no longer used

    @GetMapping("/check-email/{email}")
    public boolean checkEmail(@PathVariable String email) {
        return userService.existsByEmail(email);
    }

    @GetMapping("/find-by-phone/{phone}")
    public ResponseEntity<?> findByPhone(@PathVariable String phone) {
        Optional<User> user = userService.findByPhone(phone);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(404).body("User not found with phone: " + phone);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(404).body("User not found with id: " + id);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Optional<User> user = userService.findById(id);
            if (user.isEmpty()) {
                return ResponseEntity.status(404).body("User not found with id: " + id);
            }
            
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            Optional<User> existingUser = userService.findById(id);
            if (existingUser.isEmpty()) {
                return ResponseEntity.status(404).body("User not found with id: " + id);
            }
            
            User user = existingUser.get();
            
            // Update basic fields
            if (updatedUser.getName() != null) {
                user.setName(updatedUser.getName());
            }
            // Only update email if it's different from current email
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail())) {
                // Check if new email is already taken by another user
                if (userService.existsByEmail(updatedUser.getEmail())) {
                    return ResponseEntity.status(400).body("Email already registered to another user");
                }
                user.setEmail(updatedUser.getEmail());
            }
            // Only update phone if it's different from current phone
            if (updatedUser.getPhone() != null && !updatedUser.getPhone().equals(user.getPhone())) {
                // Check if new phone is already taken by another user
                Optional<User> existingPhone = userService.findByPhone(updatedUser.getPhone());
                if (existingPhone.isPresent() && !existingPhone.get().getId().equals(id)) {
                    return ResponseEntity.status(400).body("Phone number already registered to another user");
                }
                user.setPhone(updatedUser.getPhone());
            }
            if (updatedUser.getRole() != null) {
                user.setRole(updatedUser.getRole());
            }
            if (updatedUser.getAddress() != null) {
                user.setAddress(updatedUser.getAddress());
            }
            if (updatedUser.getDistrict() != null) {
                user.setDistrict(updatedUser.getDistrict());
            }
            if (updatedUser.getState() != null) {
                user.setState(updatedUser.getState());
            }
            if (updatedUser.getPincode() != null) {
                user.setPincode(updatedUser.getPincode());
            }
            if (updatedUser.getFarmSize() != null) {
                user.setFarmSize(updatedUser.getFarmSize());
            }
            if (updatedUser.getCropType() != null) {
                user.setCropType(updatedUser.getCropType());
            }
            if (updatedUser.getExperience() != null) {
                user.setExperience(updatedUser.getExperience());
            }
            if (updatedUser.getEquipmentOwned() != null) {
                user.setEquipmentOwned(updatedUser.getEquipmentOwned());
            }
            
            // Update location coordinates
            if (updatedUser.getLatitude() != null) {
                user.setLatitude(updatedUser.getLatitude());
            }
            if (updatedUser.getLongitude() != null) {
                user.setLongitude(updatedUser.getLongitude());
            }
            if (updatedUser.getVillage() != null) {
                user.setVillage(updatedUser.getVillage());
            }
            
            User saved = userService.saveUser(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }
}