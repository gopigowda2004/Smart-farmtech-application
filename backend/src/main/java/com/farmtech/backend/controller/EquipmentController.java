package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Equipment;
import com.farmtech.backend.entity.Farmer;
import com.farmtech.backend.entity.User;
import com.farmtech.backend.entity.Booking;
import com.farmtech.backend.repository.EquipmentRepository;
import com.farmtech.backend.repository.FarmerRepository;
import com.farmtech.backend.repository.UserRepository;
import com.farmtech.backend.repository.BookingRepository;
import com.farmtech.backend.repository.BookingCandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/equipments")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class EquipmentController {

    @Autowired
    private EquipmentRepository equipmentRepo;

    @Autowired
    private FarmerRepository farmerRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private BookingCandidateRepository candidateRepo;

    // Helper method to check if user is admin
    private boolean isAdmin(Long userId) {
        if (userId == null) return false;
        User user = userRepo.findById(userId).orElse(null);
        return user != null && "ADMIN".equals(user.getRole());
    }

    // ✅ Add new equipment (ADMIN ONLY) - path variable style
    @PostMapping("/add/{farmerId}")
    public ResponseEntity<?> addEquipment(@PathVariable Long farmerId, @RequestBody Equipment eq, @RequestParam Long userId) {
        // Check if user is admin
        if (!isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only administrators can add equipment.");
        }
        
        Farmer farmer = farmerRepo.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        eq.setOwner(farmer);
        Equipment saved = equipmentRepo.save(eq);
        return ResponseEntity.ok(saved);
    }

    // ✅ Alternative: Add new equipment with request param (ADMIN ONLY)
    @PostMapping("/add")
    public ResponseEntity<?> addEquipmentWithParam(@RequestParam Long farmerId, @RequestParam Long userId, @RequestBody Equipment eq) {
        // Check if user is admin
        if (!isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only administrators can add equipment.");
        }
        
        Farmer farmer = farmerRepo.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        eq.setOwner(farmer);
        Equipment saved = equipmentRepo.save(eq);
        return ResponseEntity.ok(saved);
    }

    // ✅ Fetch all equipment (for general listing)
    @GetMapping
    public List<Equipment> getAllEquipments() {
        return equipmentRepo.findAll();
    }

    // ✅ Fetch all other farmers' equipment
    @GetMapping("/others/{farmerId}")
    public List<Equipment> getOtherFarmersEquipments(@PathVariable Long farmerId) {
        return equipmentRepo.findByOwner_IdNot(farmerId);
    }

    // ✅ Fetch logged-in farmer’s own equipment
    @GetMapping("/my/{farmerId}")
    public List<Equipment> getMyEquipments(@PathVariable Long farmerId) {
        return equipmentRepo.findByOwner_Id(farmerId);
    }

    // ✅ Fetch equipment by ID (for checkout/details)
    @GetMapping("/{equipmentId}")
    public Equipment getById(@PathVariable Long equipmentId) {
        return equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    // ✅ Update equipment (ADMIN ONLY)
    @PutMapping("/{equipmentId}")
    public ResponseEntity<?> updateEquipment(@PathVariable Long equipmentId,
                                     @RequestParam Long farmerId,
                                     @RequestParam Long userId,
                                     @RequestBody Equipment payload) {
        // Check if user is admin
        if (!isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only administrators can update equipment.");
        }
        
        Equipment existing = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        // Update allowed fields
        existing.setName(payload.getName());
        existing.setDescription(payload.getDescription());
        existing.setPrice(payload.getPrice());
        existing.setPricePerHour(payload.getPricePerHour());
        existing.setImage(payload.getImage());
        Equipment updated = equipmentRepo.save(existing);
        return ResponseEntity.ok(updated);
    }

    // ✅ Delete equipment (ADMIN ONLY) - cascade delete dependent records to avoid FK errors
    @Transactional
    @DeleteMapping("/{equipmentId}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long equipmentId, @RequestParam Long farmerId, @RequestParam Long userId) {
        // Check if user is admin
        if (!isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only administrators can delete equipment.");
        }
        
        Equipment existing = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        // Step 1: Get all bookings for this equipment
        List<Booking> bookings = bookingRepo.findByEquipmentId(equipmentId);
        
        // Step 2: Delete booking candidates for each booking (to satisfy FK constraints)
        for (Booking booking : bookings) {
            candidateRepo.deleteAll(candidateRepo.findByBookingId(booking.getId()));
        }
        
        // Step 3: Delete the bookings
        bookingRepo.deleteByEquipmentId(equipmentId);
        
        // Step 4: Finally delete the equipment
        equipmentRepo.deleteById(equipmentId);
        
        return ResponseEntity.ok("Equipment deleted successfully");
    }

    // ✅ Check if user has admin role
    @GetMapping("/check-admin/{userId}")
    public ResponseEntity<?> checkAdminRole(@PathVariable Long userId) {
        boolean isAdminUser = isAdmin(userId);
        return ResponseEntity.ok(new AdminCheckResponse(isAdminUser));
    }

    // Response class for admin check
    public static class AdminCheckResponse {
        private boolean isAdmin;
        
        public AdminCheckResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }
        
        public boolean isAdmin() {
            return isAdmin;
        }
        
        public void setAdmin(boolean admin) {
            isAdmin = admin;
        }
    }
}
