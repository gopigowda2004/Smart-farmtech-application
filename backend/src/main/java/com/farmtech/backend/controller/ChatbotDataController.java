package com.farmtech.backend.controller;

import com.farmtech.backend.entity.*;
import com.farmtech.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot-data")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotDataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingCandidateRepository candidateRepository;

    /**
     * Get comprehensive user data for chatbot context
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserData(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            Map<String, Object> userData = new HashMap<>();

            // Basic user info
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            userData.put("phone", user.getPhone());
            userData.put("role", user.getRole());
            userData.put("address", user.getAddress());
            userData.put("district", user.getDistrict());
            userData.put("state", user.getState());
            userData.put("village", user.getVillage());
            userData.put("farmSize", user.getFarmSize());
            userData.put("cropType", user.getCropType());
            userData.put("experience", user.getExperience());

            // Get Farmer ID if exists
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
            Long farmerId = farmerOpt.map(Farmer::getId).orElse(null);
            userData.put("farmerId", farmerId);

            // Role-specific data
            if ("RENTER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
                userData.put("bookings", getRenterBookings(farmerId != null ? farmerId : userId));
            }

            if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
                userData.put("equipment", getOwnerEquipment(farmerId));
                userData.put("requests", getOwnerRequests(farmerId));
            }

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch user data: " + e.getMessage()));
        }
    }

    /**
     * Get renter's bookings
     */
    private List<Map<String, Object>> getRenterBookings(Long renterId) {
        List<Booking> bookings = bookingRepository.findByRenterId(renterId);
        return bookings.stream().map(booking -> {
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("id", booking.getId());
            bookingData.put("status", booking.getStatus());
            bookingData.put("startDate", booking.getStartDate());
            bookingData.put("endDate", booking.getEndDate());
            bookingData.put("hours", booking.getHours());
            bookingData.put("totalPrice", booking.getTotalCost());
            bookingData.put("location", booking.getLocation());
            
            Equipment equipment = booking.getEquipment();
            if (equipment != null) {
                Map<String, Object> equipmentData = new HashMap<>();
                equipmentData.put("name", equipment.getName());
                equipmentData.put("type", equipment.getType());
                bookingData.put("equipment", equipmentData);
            }
            
            return bookingData;
        }).collect(Collectors.toList());
    }

    /**
     * Get owner's equipment
     */
    private List<Map<String, Object>> getOwnerEquipment(Long ownerId) {
        if (ownerId == null) return new ArrayList<>();
        
        List<Equipment> equipmentList = equipmentRepository.findByOwner_Id(ownerId);
        return equipmentList.stream().map(equipment -> {
            Map<String, Object> equipmentData = new HashMap<>();
            equipmentData.put("id", equipment.getId());
            equipmentData.put("name", equipment.getName());
            equipmentData.put("type", equipment.getType());
            equipmentData.put("pricePerHour", equipment.getPricePerHour());
            equipmentData.put("pricePerDay", equipment.getPrice());
            return equipmentData;
        }).collect(Collectors.toList());
    }

    /**
     * Get owner's pending requests
     */
    private List<Map<String, Object>> getOwnerRequests(Long ownerId) {
        if (ownerId == null) return new ArrayList<>();
        
        // Get all pending candidates for this owner
        List<BookingCandidate> candidates = candidateRepository.findByOwnerIdAndStatus(
            ownerId, BookingCandidate.CandidateStatus.PENDING);
        
        List<Map<String, Object>> allRequests = new ArrayList<>();
        
        for (BookingCandidate candidate : candidates) {
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("candidateId", candidate.getId());
            requestData.put("bookingId", candidate.getBooking().getId());
            requestData.put("status", candidate.getStatus().toString());
            requestData.put("distance", candidate.getDistanceKm());
            requestData.put("invitedAt", candidate.getInvitedAt());
            
            Booking booking = candidate.getBooking();
            if (booking != null) {
                requestData.put("startDate", booking.getStartDate());
                requestData.put("endDate", booking.getEndDate());
                requestData.put("hours", booking.getHours());
                requestData.put("totalPrice", booking.getTotalCost());
                
                Equipment equipment = booking.getEquipment();
                if (equipment != null) {
                    requestData.put("equipmentName", equipment.getName());
                    requestData.put("equipmentType", equipment.getType());
                }
                
                Farmer renter = booking.getRenter();
                if (renter != null) {
                    Map<String, Object> renterData = new HashMap<>();
                    renterData.put("name", renter.getName());
                    renterData.put("phone", renter.getPhone());
                    renterData.put("location", renter.getAddress());
                    requestData.put("renter", renterData);
                }
            }
            
            allRequests.add(requestData);
        }
        
        return allRequests;
    }

    /**
     * Perform action on booking (cancel, approve, reject)
     */
    @PostMapping("/action")
    public ResponseEntity<?> performAction(@RequestBody Map<String, Object> request) {
        try {
            String action = (String) request.get("action");
            Long userId = Long.parseLong(request.get("userId").toString());
            
            // Verify user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            
            switch (action.toLowerCase()) {
                case "cancel_booking":
                    return cancelBooking(request, user);
                case "approve_request":
                    return approveRequest(request, user);
                case "reject_request":
                    return rejectRequest(request, user);
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "Unknown action: " + action));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Action failed: " + e.getMessage()));
        }
    }

    private ResponseEntity<?> cancelBooking(Map<String, Object> request, User user) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Booking not found"));
        }
        
        Booking booking = bookingOpt.get();
        
        // Verify ownership
        if (!booking.getRenter().getId().equals(user.getId())) {
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
            if (farmerOpt.isEmpty() || !booking.getRenter().getId().equals(farmerOpt.get().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You don't have permission to cancel this booking"));
            }
        }
        
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking cancelled successfully",
            "bookingId", bookingId
        ));
    }

    private ResponseEntity<?> approveRequest(Map<String, Object> request, User user) {
        Long candidateId = Long.parseLong(request.get("candidateId").toString());
        Optional<BookingCandidate> candidateOpt = candidateRepository.findById(candidateId);
        
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request not found"));
        }
        
        BookingCandidate candidate = candidateOpt.get();
        
        // Verify ownership - check if user is the owner of this candidate
        Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
        if (farmerOpt.isEmpty() || !candidate.getOwner().getId().equals(farmerOpt.get().getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You don't have permission to approve this request"));
        }
        
        candidate.setStatus(BookingCandidate.CandidateStatus.ACCEPTED);
        candidate.setAcceptedAt(java.time.LocalDateTime.now());
        candidateRepository.save(candidate);
        
        // Update booking status
        Booking booking = candidate.getBooking();
        booking.setStatus("CONFIRMED");
        booking.setAcceptedOwner(candidate.getOwner());
        booking.setConfirmedAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Request approved successfully",
            "candidateId", candidateId
        ));
    }

    private ResponseEntity<?> rejectRequest(Map<String, Object> request, User user) {
        Long candidateId = Long.parseLong(request.get("candidateId").toString());
        Optional<BookingCandidate> candidateOpt = candidateRepository.findById(candidateId);
        
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request not found"));
        }
        
        BookingCandidate candidate = candidateOpt.get();
        
        // Verify ownership - check if user is the owner of this candidate
        Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
        if (farmerOpt.isEmpty() || !candidate.getOwner().getId().equals(farmerOpt.get().getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You don't have permission to reject this request"));
        }
        
        candidate.setStatus(BookingCandidate.CandidateStatus.REJECTED);
        candidate.setRespondedAt(java.time.LocalDateTime.now());
        candidateRepository.save(candidate);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Request rejected successfully",
            "candidateId", candidateId
        ));
    }
}