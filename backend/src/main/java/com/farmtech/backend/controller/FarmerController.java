package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Farmer;
import com.farmtech.backend.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/farmers")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class FarmerController {

    @Autowired
    private FarmerRepository farmerRepository;

    // ✅ Get farmer profile by ID
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        Optional<Farmer> farmer = farmerRepository.findById(id);
        if (farmer.isPresent()) {
            return ResponseEntity.ok(farmer.get());
        }
        return ResponseEntity.status(404).body("Farmer not found");
    }

    // ✅ Fetch by Email
    @GetMapping("/fetch/{email}")
    public ResponseEntity<?> fetchByEmail(@PathVariable("email") String email) {
        return farmerRepository.findByEmail(email)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Farmer not found for this email"));
    }

    // ✅ Update farmer profile by ID
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Farmer updatedFarmer) {
        Optional<Farmer> existingFarmer = farmerRepository.findById(id);
        
        if (existingFarmer.isPresent()) {
            Farmer farmer = existingFarmer.get();
            
            // Update fields
            if (updatedFarmer.getName() != null) {
                farmer.setName(updatedFarmer.getName());
            }
            // Only update email if it's different from current email
            if (updatedFarmer.getEmail() != null && !updatedFarmer.getEmail().equals(farmer.getEmail())) {
                // Check if new email is already taken by another farmer
                Optional<Farmer> existingEmail = farmerRepository.findByEmail(updatedFarmer.getEmail());
                if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) {
                    return ResponseEntity.status(400).body("Email already registered to another farmer");
                }
                farmer.setEmail(updatedFarmer.getEmail());
            }
            // Only update phone if it's different from current phone
            if (updatedFarmer.getPhone() != null && !updatedFarmer.getPhone().equals(farmer.getPhone())) {
                // Check if new phone is already taken by another farmer
                Optional<Farmer> existingPhone = farmerRepository.findByPhone(updatedFarmer.getPhone());
                if (existingPhone.isPresent() && !existingPhone.get().getId().equals(id)) {
                    return ResponseEntity.status(400).body("Phone number already registered to another farmer");
                }
                farmer.setPhone(updatedFarmer.getPhone());
            }
            if (updatedFarmer.getAddress() != null) {
                farmer.setAddress(updatedFarmer.getAddress());
            }
            if (updatedFarmer.getVillage() != null) {
                farmer.setVillage(updatedFarmer.getVillage());
            }
            // Update location coordinates
            if (updatedFarmer.getLatitude() != null) {
                farmer.setLatitude(updatedFarmer.getLatitude());
            }
            if (updatedFarmer.getLongitude() != null) {
                farmer.setLongitude(updatedFarmer.getLongitude());
            }
            
            Farmer savedFarmer = farmerRepository.save(farmer);
            return ResponseEntity.ok(savedFarmer);
        }
        
        return ResponseEntity.status(404).body("Farmer not found");
    }
}
