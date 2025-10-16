package com.farmtech.backend.controller;

import com.farmtech.backend.entity.*;
import com.farmtech.backend.repository.*;
import com.farmtech.backend.service.EmailService;
import com.farmtech.backend.service.DistanceService;
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

    @Autowired
    private EmailService emailService;

    @Autowired
    private DistanceService distanceService;

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
                userData.put("bookings", fetchRenterBookings(farmerId != null ? farmerId : userId));
            }

            if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
                userData.put("equipment", fetchOwnerEquipment(farmerId));
                userData.put("requests", fetchOwnerRequests(farmerId));
            }

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch user data: " + e.getMessage()));
        }
    }

    /**
     * Get renter's bookings (helper method for /user-data endpoint)
     */
    private List<Map<String, Object>> fetchRenterBookings(Long renterId) {
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
     * Get owner's equipment (helper method for /user-data endpoint)
     */
    private List<Map<String, Object>> fetchOwnerEquipment(Long ownerId) {
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
     * Get owner's pending requests (helper method for /user-data endpoint)
     */
    private List<Map<String, Object>> fetchOwnerRequests(Long ownerId) {
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

    /**
     * Get available equipment for booking
     */
    @GetMapping("/available-equipment")
    public ResponseEntity<?> getAvailableEquipment() {
        try {
            List<Equipment> allEquipment = equipmentRepository.findAll();
            
            List<Map<String, Object>> equipmentList = allEquipment.stream()
                .map(eq -> {
                    Map<String, Object> equipData = new HashMap<>();
                    equipData.put("id", eq.getId());
                    equipData.put("name", eq.getName());
                    equipData.put("type", eq.getType());
                    equipData.put("pricePerHour", eq.getPrice());
                    equipData.put("description", eq.getDescription());
                    return equipData;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(equipmentList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get renter's bookings for chatbot
     */
    @GetMapping("/renter-bookings")
    public ResponseEntity<?> getRenterBookings(@RequestParam Long userId) {
        try {
            // Find user
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Find farmer record
            User user = userOpt.get();
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
            if (farmerOpt.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            Farmer farmer = farmerOpt.get();
            List<Booking> bookings = bookingRepository.findByRenterId(farmer.getId());

            List<Map<String, Object>> bookingList = bookings.stream()
                .map(booking -> {
                    Map<String, Object> bookingData = new HashMap<>();
                    bookingData.put("id", booking.getId());
                    bookingData.put("status", booking.getStatus());
                    bookingData.put("startDate", booking.getStartDate());
                    bookingData.put("endDate", booking.getEndDate());
                    bookingData.put("duration", booking.getHours());
                    bookingData.put("totalCost", booking.getTotalCost());
                    bookingData.put("location", booking.getLocation());
                    
                    Equipment equipment = booking.getEquipment();
                    if (equipment != null) {
                        bookingData.put("equipmentName", equipment.getName());
                        bookingData.put("equipmentType", equipment.getType());
                    }
                    
                    return bookingData;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(bookingList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get owner's pending requests for chatbot
     */
    @GetMapping("/owner-requests")
    public ResponseEntity<?> getOwnerRequests(@RequestParam Long farmerId) {
        try {
            // Get all pending candidates for this owner
            List<BookingCandidate> candidates = candidateRepository.findByOwnerIdAndStatus(
                farmerId, BookingCandidate.CandidateStatus.PENDING);
            
            List<Map<String, Object>> requestList = candidates.stream()
                .map(candidate -> {
                    Map<String, Object> requestData = new HashMap<>();
                    requestData.put("candidateId", candidate.getId());
                    requestData.put("distance", candidate.getDistanceKm());
                    
                    Booking booking = candidate.getBooking();
                    if (booking != null) {
                        requestData.put("bookingId", booking.getId());
                        requestData.put("startDate", booking.getStartDate());
                        requestData.put("duration", booking.getHours());
                        requestData.put("totalCost", booking.getTotalCost());
                        requestData.put("location", booking.getLocation());
                        
                        Equipment equipment = booking.getEquipment();
                        if (equipment != null) {
                            requestData.put("equipmentName", equipment.getName());
                            requestData.put("equipmentType", equipment.getType());
                        }
                        
                        Farmer renter = booking.getRenter();
                        if (renter != null) {
                            requestData.put("renterName", renter.getName());
                            requestData.put("renterPhone", renter.getPhone());
                        }
                    }
                    
                    return requestData;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(requestList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get owner's equipment for chatbot
     */
    @GetMapping("/owner-equipment")
    public ResponseEntity<?> getOwnerEquipment(@RequestParam Long farmerId) {
        try {
            List<Equipment> equipmentList = equipmentRepository.findByOwner_Id(farmerId);
            
            List<Map<String, Object>> equipData = equipmentList.stream()
                .map(eq -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", eq.getId());
                    data.put("name", eq.getName());
                    data.put("type", eq.getType());
                    data.put("pricePerHour", eq.getPrice());
                    return data;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(equipData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new booking through chatbot
     */
    @PostMapping("/create-booking")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            System.out.println("=== CREATE BOOKING REQUEST (CHATBOT) ===");
            System.out.println("Request data: " + bookingData);
            
            Long equipmentId = Long.parseLong(bookingData.get("equipmentId").toString());
            Long renterId = Long.parseLong(bookingData.get("renterId").toString());
            String startTime = bookingData.get("startTime").toString();
            Integer duration = Integer.parseInt(bookingData.get("duration").toString());
            String location = bookingData.get("location").toString();
            Double totalCost = Double.parseDouble(bookingData.get("totalCost").toString());
            
            // Extract location coordinates if provided
            Double locationLatitude = null;
            Double locationLongitude = null;
            if (bookingData.containsKey("locationLatitude") && bookingData.get("locationLatitude") != null) {
                locationLatitude = Double.parseDouble(bookingData.get("locationLatitude").toString());
            }
            if (bookingData.containsKey("locationLongitude") && bookingData.get("locationLongitude") != null) {
                locationLongitude = Double.parseDouble(bookingData.get("locationLongitude").toString());
            }
            
            System.out.println("Equipment ID: " + equipmentId);
            System.out.println("Renter ID: " + renterId);
            System.out.println("Location: " + location);
            System.out.println("Coordinates: " + locationLatitude + ", " + locationLongitude);

            // Find equipment
            Optional<Equipment> equipmentOpt = equipmentRepository.findById(equipmentId);
            if (equipmentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Equipment not found"));
            }

            // Find renter user
            Optional<User> userOpt = userRepository.findById(renterId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Find or create Farmer record for the renter
            User user = userOpt.get();
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(user.getPhone());
            Farmer renterFarmer;
            
            if (farmerOpt.isEmpty()) {
                // Create Farmer record if doesn't exist
                renterFarmer = new Farmer();
                renterFarmer.setName(user.getName());
                renterFarmer.setEmail(user.getEmail());
                renterFarmer.setPhone(user.getPhone());
                renterFarmer.setPassword(user.getPassword());
                renterFarmer.setAddress(user.getAddress());
                renterFarmer = farmerRepository.save(renterFarmer);
                System.out.println("✅ Created Farmer record for renter: " + renterFarmer.getId());
            } else {
                renterFarmer = farmerOpt.get();
                System.out.println("✅ Found existing Farmer record: " + renterFarmer.getId());
            }

            // Parse startTime to LocalDate
            java.time.LocalDateTime startDateTime = java.time.LocalDateTime.parse(startTime);
            java.time.LocalDate startDate = startDateTime.toLocalDate();

            // Create booking
            Equipment equipment = equipmentOpt.get();
            Booking booking = new Booking();
            booking.setEquipment(equipment);
            booking.setOwner(equipment.getOwner());
            booking.setRenter(renterFarmer);
            booking.setStartDate(startDate);
            booking.setHours(duration);
            booking.setLocation(location);
            booking.setLocationLatitude(locationLatitude);
            booking.setLocationLongitude(locationLongitude);
            booking.setTotalCost(totalCost);
            booking.setStatus("PENDING");
            booking.setCreatedAt(java.time.LocalDateTime.now());

            Booking savedBooking = bookingRepository.save(booking);
            System.out.println("✅ Booking saved with ID: " + savedBooking.getId());

            // Create candidate entries for nearby owners
            createCandidateEntriesForChatbot(savedBooking);

            // Send email notification to booker
            try {
                String renterEmail = renterFarmer.getEmail();
                String renterName = renterFarmer.getName();
                
                if (renterEmail != null && !renterEmail.isBlank()) {
                    emailService.sendBookingConfirmationToBooker(
                        renterEmail, 
                        renterName, 
                        equipment.getName(), 
                        startDate.toString(), 
                        duration, 
                        savedBooking.getId()
                    );
                    System.out.println("✅ [ChatbotDataController] Email sent to: " + renterEmail);
                }
            } catch (Exception e) {
                System.err.println("❌ [ChatbotDataController] Failed to send email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Booking created successfully",
                "bookingId", savedBooking.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create booking candidate entries for all OWNER users
     */
    private void createCandidateEntriesForChatbot(Booking booking) {
        System.out.println("=== CREATING CANDIDATE ENTRIES (CHATBOT) ===");
        System.out.println("Booking ID: " + booking.getId());
        System.out.println("Equipment Type: " + booking.getEquipment().getType());
        System.out.println("Renter ID: " + booking.getRenter().getId());

        // Get all OWNER users
        List<User> ownerUsers = userRepository.findByRole("OWNER");
        System.out.println("Total OWNER users found: " + ownerUsers.size());
        
        if (ownerUsers.isEmpty()) {
            System.err.println("⚠️ WARNING: No OWNER users found in database!");
            return;
        }
        
        List<Farmer> potentialOwners = new ArrayList<>();
        
        for (User ownerUser : ownerUsers) {
            System.out.println("\n--- Processing OWNER user: " + ownerUser.getName() + " (ID: " + ownerUser.getId() + ")");
            
            // Get or create Farmer record for each owner
            Optional<Farmer> farmerOpt = farmerRepository.findByPhone(ownerUser.getPhone());
            Farmer ownerFarmer;
            
            if (farmerOpt.isEmpty()) {
                // Create Farmer record if doesn't exist
                ownerFarmer = new Farmer();
                ownerFarmer.setName(ownerUser.getName());
                ownerFarmer.setEmail(ownerUser.getEmail());
                ownerFarmer.setPhone(ownerUser.getPhone());
                ownerFarmer.setPassword(ownerUser.getPassword());
                ownerFarmer.setAddress(ownerUser.getAddress());
                ownerFarmer = farmerRepository.save(ownerFarmer);
                System.out.println("✅ Created Farmer record for OWNER user: " + ownerUser.getId() + " -> Farmer ID: " + ownerFarmer.getId());
            } else {
                ownerFarmer = farmerOpt.get();
                System.out.println("✅ Found existing Farmer record: " + ownerFarmer.getId());
            }
            
            // Check if this owner has the requested equipment type
            List<Equipment> ownerEquipment = equipmentRepository.findByOwner_Id(ownerFarmer.getId());
            System.out.println("   Owner has " + ownerEquipment.size() + " equipment(s)");
            
            for (Equipment eq : ownerEquipment) {
                System.out.println("   - Equipment: " + eq.getName() + " (Type: " + eq.getType() + ")");
            }
            
            boolean hasMatchingEquipment = ownerEquipment.stream()
                .anyMatch(eq -> eq.getType().equalsIgnoreCase(booking.getEquipment().getType()));
            
            if (hasMatchingEquipment) {
                System.out.println("   ✅ MATCH! Owner has matching equipment type");
                potentialOwners.add(ownerFarmer);
            } else {
                System.out.println("   ❌ NO MATCH: Owner doesn't have " + booking.getEquipment().getType());
            }
        }
        
        System.out.println("\n=== SUMMARY ===");
        System.out.println("Potential owners with matching equipment: " + potentialOwners.size());
        
        // Create candidate entries
        for (Farmer owner : potentialOwners) {
            // Skip if owner is the same as renter
            if (owner.getId().equals(booking.getRenter().getId())) {
                continue;
            }
            
            // Calculate distance (default to 0 if coordinates not available)
            Double distance = 0.0;
            try {
                if (booking.getLocationLatitude() != null && booking.getLocationLongitude() != null &&
                    owner.getLatitude() != null && owner.getLongitude() != null) {
                    distance = distanceService.distanceInKm(
                        booking.getLocationLatitude(), 
                        booking.getLocationLongitude(),
                        owner.getLatitude(), 
                        owner.getLongitude()
                    );
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to calculate distance for owner: " + owner.getId());
            }
            
            // Create candidate
            BookingCandidate candidate = new BookingCandidate();
            candidate.setBooking(booking);
            candidate.setOwner(owner);
            candidate.setStatus(BookingCandidate.CandidateStatus.PENDING);
            candidate.setDistanceKm(distance);
            candidate.setInvitedAt(java.time.LocalDateTime.now());
            
            candidateRepository.save(candidate);
            System.out.println("✅ Created candidate for owner: " + owner.getName() + " (Distance: " + distance + " km)");
        }
        
        System.out.println("=== CANDIDATE CREATION COMPLETE ===");
    }
}