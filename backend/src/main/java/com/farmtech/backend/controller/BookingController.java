package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Booking;
import com.farmtech.backend.entity.BookingCandidate;
import com.farmtech.backend.entity.BookingCandidate.CandidateStatus;
import com.farmtech.backend.entity.Equipment;
import com.farmtech.backend.entity.Farmer;
import com.farmtech.backend.entity.User;
import com.farmtech.backend.repository.BookingCandidateRepository;
import com.farmtech.backend.repository.BookingRepository;
import com.farmtech.backend.repository.EquipmentRepository;
import com.farmtech.backend.repository.FarmerRepository;
import com.farmtech.backend.repository.UserRepository;
import com.farmtech.backend.service.BookingAnalyticsService;
import com.farmtech.backend.service.CandidateDispatchService;
import com.farmtech.backend.service.DistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookingController {

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private EquipmentRepository equipmentRepo;

    @Autowired
    private FarmerRepository farmerRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private com.farmtech.backend.service.SmsService smsService;

    @Autowired
    private com.farmtech.backend.service.EmailService emailService;

    @Autowired
    private DistanceService distanceService;

    @Autowired
    private BookingCandidateRepository candidateRepository;

    @Autowired
    private CandidateDispatchService candidateDispatchService;

    private static final double SEARCH_RADIUS_KM = 50.0;

    // Create a booking: renter books an equipment (owner inferred from equipment)
    @PostMapping("/create")
    public Booking createBooking(@RequestParam Long equipmentId,
                                 @RequestParam Long renterId,
                                 @RequestParam String startDate,
                                 @RequestParam(required = false) String endDate,
                                 @RequestParam(required = false) Integer hours,
                                 @RequestParam(required = false) String location,
                                 @RequestParam(required = false) Double locationLatitude,
                                 @RequestParam(required = false) Double locationLongitude) {
        System.out.println("📍 CREATE BOOKING - Received coordinates:");
        System.out.println("   locationLatitude: " + locationLatitude);
        System.out.println("   locationLongitude: " + locationLongitude);
        System.out.println("   location: " + location);
        
        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        // 🔍 Support both User and Farmer entities for dual authentication
        Farmer renter = null;
        
        // First, try to find a Farmer with the renterId
        renter = farmerRepo.findById(renterId).orElse(null);
        
        // If not found, try to find a User and get/create their Farmer record
        if (renter == null) {
            User user = userRepo.findById(renterId).orElse(null);
            
            if (user != null) {
                // User exists, check if they have a corresponding Farmer record
                renter = farmerRepo.findByPhone(user.getPhone()).orElse(null);
                
                // If no Farmer record exists, create one automatically
                if (renter == null) {
                    Farmer newFarmer = new Farmer();
                    newFarmer.setName(user.getName());
                    newFarmer.setEmail(user.getEmail());
                    newFarmer.setPhone(user.getPhone());
                    newFarmer.setPassword(user.getPassword());
                    newFarmer.setAddress(user.getAddress());
                    // Note: latitude/longitude will be null initially
                    renter = farmerRepo.save(newFarmer);
                    System.out.println("✅ Created new Farmer record for User ID: " + user.getId() + " -> Farmer ID: " + renter.getId());
                }
            }
        }
        
        // If still null, throw error
        if (renter == null) {
            throw new RuntimeException("Renter not found with ID: " + renterId);
        }

        Booking booking = new Booking();
        booking.setEquipment(equipment);
        booking.setOwner(equipment.getOwner());
        booking.setRenter(renter);
        booking.setStartDate(LocalDate.parse(startDate));
        if (hours != null && hours > 0) {
            booking.setHours(hours);
            booking.setTotalCost(calculateTotalCost(equipment, hours));
            // Derive endDate at day granularity to keep compatibility
            int days = Math.max(1, (int) Math.ceil(hours / 24.0));
            LocalDate end = LocalDate.parse(startDate).plusDays(days);
            booking.setEndDate(end);
        } else if (endDate != null && !endDate.isEmpty()) {
            booking.setEndDate(LocalDate.parse(endDate));
        }
        booking.setStatus("PENDING");
        if (location != null && !location.trim().isEmpty()) {
            booking.setLocation(location.trim());
        }
        if (locationLatitude != null && locationLongitude != null) {
            System.out.println("✅ Setting coordinates on booking object:");
            System.out.println("   Latitude: " + locationLatitude);
            System.out.println("   Longitude: " + locationLongitude);
            booking.setLocationLatitude(locationLatitude);
            booking.setLocationLongitude(locationLongitude);
        } else {
            System.out.println("⚠️ Coordinates are NULL - not setting on booking");
        }
        
        // Set the created timestamp
        booking.setCreatedAt(LocalDateTime.now());
        
        Booking saved = bookingRepo.save(booking);
        System.out.println("💾 Booking saved with ID: " + saved.getId());
        System.out.println("   Saved latitude: " + saved.getLocationLatitude());
        System.out.println("   Saved longitude: " + saved.getLocationLongitude());

        // create candidate list for other nearby owners
        createCandidateEntries(saved);

        // Send SMS notification to renter only (owner flow is sequential)
        try {
            String renterPhone = renter.getPhone();
            String renterMsg = String.format(
                    "You booked %s. Start %s, Hours %s. Booking ID %s.",
                    equipment.getName(), startDate, (hours != null ? hours : "-"), saved.getId()
            );
            if (renterPhone != null && !renterPhone.isBlank()) {
                smsService.sendSms(renterPhone, renterMsg);
            }
        } catch (Exception ignore) {}

        // Send email notification to booker
        try {
            String renterEmail = renter.getEmail();
            String renterName = renter.getName();
            System.out.println("📧 [BookingController] Attempting to send booking confirmation email...");
            System.out.println("   Renter Email: " + renterEmail);
            System.out.println("   Renter Name: " + renterName);
            System.out.println("   Equipment: " + equipment.getName());
            System.out.println("   Booking ID: " + saved.getId());
            
            if (renterEmail != null && !renterEmail.isBlank()) {
                emailService.sendBookingConfirmationToBooker(
                    renterEmail, 
                    renterName, 
                    equipment.getName(), 
                    startDate, 
                    hours, 
                    saved.getId()
                );
                System.out.println("✅ [BookingController] Email service called successfully");
            } else {
                System.out.println("⚠️ [BookingController] Renter email is null or blank - skipping email");
            }
        } catch (Exception e) {
            System.err.println("❌ [BookingController] Failed to send booking confirmation email: " + e.getMessage());
            e.printStackTrace();
        }

        return saved;
    }

    private void createCandidateEntries(Booking booking) {
        System.out.println("=== CREATING CANDIDATE ENTRIES ===");
        System.out.println("Booking ID: " + booking.getId());
        System.out.println("Creating candidates for OWNER role accounts only (no location restrictions)");

        // NEW APPROACH: Start with Users who have OWNER role, then get/create their Farmer records
        List<User> ownerUsers = userRepo.findByRole("OWNER");
        System.out.println("Total OWNER users in database: " + ownerUsers.size());
        
        List<Farmer> potentialOwners = new ArrayList<>();
        
        for (User ownerUser : ownerUsers) {
            System.out.println("Processing OWNER user: " + ownerUser.getId() + " (" + ownerUser.getName() + ")");
            
            // Find or create Farmer record for this OWNER user
            Farmer farmer = farmerRepo.findByPhone(ownerUser.getPhone()).orElse(null);
            
            if (farmer == null) {
                // Auto-create Farmer record for this OWNER user
                System.out.println("  ⚠️ No Farmer record found, creating one...");
                Farmer newFarmer = new Farmer();
                newFarmer.setName(ownerUser.getName());
                newFarmer.setEmail(ownerUser.getEmail());
                newFarmer.setPhone(ownerUser.getPhone());
                newFarmer.setPassword(ownerUser.getPassword());
                newFarmer.setAddress(ownerUser.getAddress());
                // Note: latitude/longitude will be null initially
                farmer = farmerRepo.save(newFarmer);
                System.out.println("  ✅ Created Farmer ID: " + farmer.getId() + " for OWNER User ID: " + ownerUser.getId());
            } else {
                System.out.println("  ✅ Found existing Farmer ID: " + farmer.getId());
            }
            
            // Skip if this is the original equipment owner
            if (farmer.getId().equals(booking.getOwner().getId())) {
                System.out.println("  ⏭️ Skipping - this is the original equipment owner");
                continue;
            }
            
            potentialOwners.add(farmer);
        }
        
        System.out.println("Potential OWNER accepter accounts: " + potentialOwners.size());

        // Create candidates for ALL potential owners (no distance restriction)
        List<BookingCandidate> candidates = potentialOwners.stream()
                .map(owner -> {
                    System.out.println("✅ Creating candidate for farmer " + owner.getId() + " (" + owner.getName() + ")");
                    
                    BookingCandidate candidate = new BookingCandidate();
                    candidate.setBooking(booking);
                    candidate.setOwner(owner);
                    
                    // Calculate distance if coordinates are available, otherwise set to 0
                    if (booking.getLocationLatitude() != null && booking.getLocationLongitude() != null
                            && owner.getLatitude() != null && owner.getLongitude() != null) {
                        double distance = distanceService.distanceInKm(
                                booking.getLocationLatitude(),
                                booking.getLocationLongitude(),
                                owner.getLatitude(),
                                owner.getLongitude()
                        );
                        candidate.setDistanceKm(distance);
                        System.out.println("   Distance: " + distance + " km");
                    } else {
                        candidate.setDistanceKm(0.0);
                        System.out.println("   Distance: N/A (no coordinates)");
                    }
                    
                    candidate.setStatus(CandidateStatus.NOTIFIED);
                    candidate.setInvitedAt(LocalDateTime.now());
                    return candidate;
                })
                .sorted(Comparator.comparing(BookingCandidate::getDistanceKm))
                .collect(Collectors.toList());

        System.out.println("Total candidates created: " + candidates.size());
        candidateRepository.saveAll(candidates);
        System.out.println("✅ Candidates saved to database");
        candidateDispatchService.notifyCandidatesSimultaneously(booking.getId());
    }

    private Double calculateTotalCost(Equipment equipment, int hours) {
        Double pricePerHour = equipment.getPricePerHour();
        if (pricePerHour == null) {
            // Fallback to daily price if hourly not set
            pricePerHour = equipment.getPrice() / 24.0;
        }
        return Math.round(pricePerHour * hours * 100.0) / 100.0; // Round to 2 decimal places
    }

    // Bookings the renter has made (buyer account view)
    @GetMapping("/renter/{renterId}")
    public List<Booking> getRenterBookings(@PathVariable Long renterId) {
        System.out.println("=== FETCHING ALL BOOKINGS FOR RENTER ===");
        System.out.println("Renter ID from path: " + renterId);
        
        // 🔍 Support both User and Farmer IDs
        Long actualFarmerId = renterId;
        
        // Check if this is a User ID, and get their Farmer ID
        User user = userRepo.findById(renterId).orElse(null);
        if (user != null) {
            System.out.println("✅ Found User with ID: " + renterId + ", looking for corresponding Farmer...");
            Farmer farmer = farmerRepo.findByPhone(user.getPhone()).orElse(null);
            if (farmer != null) {
                actualFarmerId = farmer.getId();
                System.out.println("✅ Found corresponding Farmer ID: " + actualFarmerId);
            } else {
                System.out.println("⚠️ No Farmer record found for User ID: " + renterId);
                return List.of(); // Return empty list if no Farmer record exists
            }
        }
        
        System.out.println("Querying: SELECT * FROM bookings WHERE renter_id = " + actualFarmerId);
        
        List<Booking> bookings = bookingRepo.findByRenterId(actualFarmerId);
        System.out.println("Found " + bookings.size() + " bookings for renter " + actualFarmerId);
        
        if (bookings.isEmpty()) {
            System.out.println("✅ No bookings found for this renter");
        } else {
            System.out.println("📋 Bookings details:");
            for (Booking booking : bookings) {
                System.out.println("  - Booking ID: " + booking.getId() + 
                                 ", Status: " + booking.getStatus() +
                                 ", Renter ID: " + (booking.getRenter() != null ? booking.getRenter().getId() : "null") +
                                 ", Renter Name: " + (booking.getRenter() != null ? booking.getRenter().getName() : "null") +
                                 ", Equipment: " + (booking.getEquipment() != null ? booking.getEquipment().getName() : "null"));
            }
        }
        
        System.out.println("=== FETCH COMPLETE ===");
        return bookings;
    }

    // Bookings the owner has received (owner account view)
    @GetMapping("/owner/{ownerId}")
    public List<Booking> getOwnerBookings(@PathVariable Long ownerId) {
        System.out.println("=== FETCHING ALL BOOKINGS FOR OWNER ===");
        System.out.println("Owner ID from path: " + ownerId);
        
        // 🔍 Support both User and Farmer IDs
        Long actualFarmerId = ownerId;
        
        // Check if this is a User ID, and get their Farmer ID
        User user = userRepo.findById(ownerId).orElse(null);
        if (user != null) {
            System.out.println("✅ Found User with ID: " + ownerId + ", looking for corresponding Farmer...");
            Farmer farmer = farmerRepo.findByPhone(user.getPhone()).orElse(null);
            if (farmer != null) {
                actualFarmerId = farmer.getId();
                System.out.println("✅ Found corresponding Farmer ID: " + actualFarmerId);
            } else {
                System.out.println("⚠️ No Farmer record found for User ID: " + ownerId);
                return List.of(); // Return empty list if no Farmer record exists
            }
        }
        
        List<Booking> bookings = bookingRepo.findByOwnerId(actualFarmerId);
        System.out.println("Found " + bookings.size() + " bookings for owner " + actualFarmerId);
        return bookings;
    }

    // Get all pending bookings (for Ola/Uber style dashboard)
    @GetMapping("/pending")
    public List<Booking> getAllPendingBookings() {
        // Include both PENDING and PENDING_NO_CANDIDATES status bookings
        List<Booking> pendingBookings = bookingRepo.findByStatus("PENDING");
        List<Booking> noCandidatesBookings = bookingRepo.findByStatus("PENDING_NO_CANDIDATES");
        
        // Combine both lists
        pendingBookings.addAll(noCandidatesBookings);
        return pendingBookings;
    }
    
    // Get ALL bookings (for admin dashboard)
    @GetMapping
    public List<Booking> getAllBookings() {
        System.out.println("=== FETCHING ALL BOOKINGS (ADMIN) ===");
        List<Booking> allBookings = bookingRepo.findAll();
        System.out.println("Total bookings in database: " + allBookings.size());
        
        // Log booking status breakdown
        long pending = allBookings.stream().filter(b -> "PENDING".equals(b.getStatus())).count();
        long confirmed = allBookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count();
        long completed = allBookings.stream().filter(b -> "COMPLETED".equals(b.getStatus())).count();
        long cancelled = allBookings.stream().filter(b -> "CANCELLED".equals(b.getStatus())).count();
        
        System.out.println("Status breakdown:");
        System.out.println("  PENDING: " + pending);
        System.out.println("  CONFIRMED: " + confirmed);
        System.out.println("  COMPLETED: " + completed);
        System.out.println("  CANCELLED: " + cancelled);
        
        return allBookings;
    }

    // Optional: update status (owner can confirm/cancel)
    @PatchMapping("/{bookingId}/status")
    public Booking updateStatus(@PathVariable Long bookingId, @RequestParam String status) {
        Booking b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        b.setStatus(status);
        
        // If confirming, set the accepted owner to current user
        if ("CONFIRMED".equals(status)) {
            // Note: In a real app, you'd get the current user from authentication
            // For now, we'll set it when the frontend provides the owner ID
        }
        
        return bookingRepo.save(b);
    }
    
    // Accept booking with owner details
    @PatchMapping("/{bookingId}/accept")
    public Booking acceptBooking(@PathVariable Long bookingId, @RequestParam Long ownerId) {
        System.out.println("=== ACCEPTING BOOKING ===");
        System.out.println("Booking ID: " + bookingId);
        System.out.println("Owner ID: " + ownerId);
        
        try {
            Booking booking = bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
            
            System.out.println("Found booking: " + booking.getId() + ", Status: " + booking.getStatus());
            
            Farmer acceptingOwner = farmerRepo.findById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found with ID: " + ownerId));
            
            System.out.println("Found owner: " + acceptingOwner.getId() + ", Name: " + acceptingOwner.getName());
            
            booking.setStatus("CONFIRMED");
            booking.setAcceptedOwner(acceptingOwner);
            booking.setConfirmedAt(java.time.LocalDateTime.now());
            
            System.out.println("Updated booking status to CONFIRMED");
            
            // Update all other candidates for this booking to EXPIRED status
            // so they don't see this booking in their pending list anymore
            List<BookingCandidate> allCandidates = candidateRepository.findByBookingId(bookingId);
            System.out.println("Found " + allCandidates.size() + " candidates for this booking");
            
            for (BookingCandidate candidate : allCandidates) {
                if (!candidate.getOwner().getId().equals(ownerId)) {
                    candidate.setStatus(CandidateStatus.EXPIRED);
                    candidate.setExpiredAt(java.time.LocalDateTime.now());
                    System.out.println("Expired candidate for owner: " + candidate.getOwner().getId());
                } else {
                    candidate.setStatus(CandidateStatus.ACCEPTED);
                    candidate.setAcceptedAt(java.time.LocalDateTime.now());
                    System.out.println("Accepted candidate for owner: " + candidate.getOwner().getId());
                }
            }
            candidateRepository.saveAll(allCandidates);
            
            Booking savedBooking = bookingRepo.save(booking);
            System.out.println("✅ Booking accepted successfully!");
            
            // Send email notification to the booker (renter)
            try {
                Farmer renter = booking.getRenter();
                String renterEmail = renter.getEmail();
                if (renterEmail != null && !renterEmail.isBlank()) {
                    emailService.sendBookingAcceptanceToBooker(
                        renterEmail,
                        renter.getName(),
                        booking.getEquipment().getName(),
                        acceptingOwner.getName(),
                        acceptingOwner.getPhone(),
                        booking.getId()
                    );
                    System.out.println("📧 Sent acceptance email to booker: " + renterEmail);
                }
            } catch (Exception e) {
                System.err.println("Failed to send acceptance email to booker: " + e.getMessage());
            }
            
            // Send email notification to the owner who accepted
            try {
                String ownerEmail = acceptingOwner.getEmail();
                if (ownerEmail != null && !ownerEmail.isBlank()) {
                    Farmer renter = booking.getRenter();
                    emailService.sendBookingAcceptanceToOwner(
                        ownerEmail,
                        acceptingOwner.getName(),
                        booking.getEquipment().getName(),
                        renter.getName(),
                        renter.getPhone(),
                        renter.getEmail(),
                        booking.getLocation(),
                        booking.getStartDate().toString(),
                        booking.getHours(),
                        booking.getId()
                    );
                    System.out.println("📧 Sent acceptance email to owner: " + ownerEmail);
                }
            } catch (Exception e) {
                System.err.println("Failed to send acceptance email to owner: " + e.getMessage());
            }
            
            System.out.println("=== ACCEPT COMPLETE ===");
            
            return savedBooking;
        } catch (Exception e) {
            System.err.println("❌ Error accepting booking: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // Get confirmed bookings for an owner (bookings they accepted)
    @GetMapping("/owner/{ownerId}/accepted")
    public List<Booking> getAcceptedBookingsByOwner(@PathVariable Long ownerId) {
        System.out.println("=== FETCHING ACCEPTED BOOKINGS FOR OWNER ===");
        System.out.println("Owner ID: " + ownerId);
        
        // 🔍 Support both User and Farmer IDs
        Long actualFarmerId = ownerId;
        
        // Check if this is a User ID, and get their Farmer ID
        User user = userRepo.findById(ownerId).orElse(null);
        if (user != null) {
            System.out.println("✅ Found User with ID: " + ownerId + ", looking for corresponding Farmer...");
            Farmer farmer = farmerRepo.findByPhone(user.getPhone()).orElse(null);
            if (farmer != null) {
                actualFarmerId = farmer.getId();
                System.out.println("✅ Found corresponding Farmer ID: " + actualFarmerId);
            } else {
                System.out.println("⚠️ No Farmer record found for User ID: " + ownerId);
                return List.of(); // Return empty list if no Farmer record exists
            }
        }
        
        List<Booking> bookings = bookingRepo.findByAcceptedOwnerId(actualFarmerId);
        System.out.println("Found " + bookings.size() + " accepted bookings");
        
        for (Booking booking : bookings) {
            System.out.println("Booking ID: " + booking.getId() + 
                             ", Status: " + booking.getStatus() +
                             ", AcceptedOwner ID: " + (booking.getAcceptedOwner() != null ? booking.getAcceptedOwner().getId() : "null") +
                             ", Renter ID: " + (booking.getRenter() != null ? booking.getRenter().getId() : "null"));
        }
        
        return bookings;
    }
    
    // Get confirmed bookings for a renter (bookings that were accepted)
    @GetMapping("/renter/{renterId}/confirmed")
    public List<Booking> getConfirmedBookingsByRenter(@PathVariable Long renterId) {
        System.out.println("=== FETCHING CONFIRMED BOOKINGS FOR RENTER ===");
        System.out.println("Renter ID from path: " + renterId);
        
        // 🔍 Support both User and Farmer IDs
        Long actualFarmerId = renterId;
        
        // Check if this is a User ID, and get their Farmer ID
        User user = userRepo.findById(renterId).orElse(null);
        if (user != null) {
            System.out.println("✅ Found User with ID: " + renterId + ", looking for corresponding Farmer...");
            Farmer farmer = farmerRepo.findByPhone(user.getPhone()).orElse(null);
            if (farmer != null) {
                actualFarmerId = farmer.getId();
                System.out.println("✅ Found corresponding Farmer ID: " + actualFarmerId);
            } else {
                System.out.println("⚠️ No Farmer record found for User ID: " + renterId);
                return List.of(); // Return empty list if no Farmer record exists
            }
        }
        
        System.out.println("Querying: SELECT * FROM bookings WHERE renter_id = " + actualFarmerId + " AND status = 'CONFIRMED'");
        
        List<Booking> bookings = bookingRepo.findByRenterIdAndStatus(actualFarmerId, "CONFIRMED");
        System.out.println("Found " + bookings.size() + " confirmed bookings for renter " + actualFarmerId);
        
        if (bookings.isEmpty()) {
            System.out.println("✅ No confirmed bookings found for this renter (correct if they haven't booked anything)");
        } else {
            System.out.println("📋 Bookings details:");
            for (Booking booking : bookings) {
                System.out.println("  - Booking ID: " + booking.getId() + 
                                 ", Status: " + booking.getStatus() +
                                 ", Renter ID: " + (booking.getRenter() != null ? booking.getRenter().getId() : "null") +
                                 ", Renter Name: " + (booking.getRenter() != null ? booking.getRenter().getName() : "null") +
                                 ", AcceptedOwner ID: " + (booking.getAcceptedOwner() != null ? booking.getAcceptedOwner().getId() : "null") +
                                 ", Equipment: " + (booking.getEquipment() != null ? booking.getEquipment().getName() : "null"));
            }
        }
        
        System.out.println("=== FETCH COMPLETE ===");
        return bookings;
    }
    
    // Get pending booking invitations for an owner (bookings they can accept)
    @GetMapping("/owner/{ownerId}/pending-invitations")
    public List<BookingCandidate> getPendingInvitationsForOwner(@PathVariable Long ownerId) {
        System.out.println("=== FETCHING PENDING INVITATIONS ===");
        System.out.println("Owner ID: " + ownerId);
        
        // 🔍 Support both User and Farmer IDs
        Long actualFarmerId = ownerId;
        
        // Check if this is a User ID, and get their Farmer ID
        User user = userRepo.findById(ownerId).orElse(null);
        if (user != null) {
            System.out.println("✅ Found User with ID: " + ownerId + ", looking for corresponding Farmer...");
            Farmer farmer = farmerRepo.findByPhone(user.getPhone()).orElse(null);
            if (farmer != null) {
                actualFarmerId = farmer.getId();
                System.out.println("✅ Found corresponding Farmer ID: " + actualFarmerId);
            } else {
                System.out.println("⚠️ No Farmer record found for User ID: " + ownerId);
                return List.of(); // Return empty list if no Farmer record exists
            }
        }
        
        List<BookingCandidate> candidates = candidateRepository.findByOwnerIdAndStatusOrderByInvitedAtAsc(actualFarmerId, CandidateStatus.NOTIFIED);
        System.out.println("Found " + candidates.size() + " pending invitations");
        
        for (BookingCandidate candidate : candidates) {
            System.out.println("Candidate ID: " + candidate.getId() + 
                             ", Booking ID: " + candidate.getBooking().getId() +
                             ", Status: " + candidate.getStatus() +
                             ", Distance: " + candidate.getDistanceKm() + " km");
        }
        
        return candidates;
    }
    
    // Get all booking candidates for an owner (all statuses - for dashboard)
    @GetMapping("/owner/{ownerId}/candidates")
    public List<BookingCandidate> getAllCandidatesForOwner(@PathVariable Long ownerId) {
        return candidateRepository.findByOwnerIdOrderByInvitedAtDesc(ownerId);
    }
    
    // Update estimated arrival time for a booking
    @PatchMapping("/{bookingId}/arrival-time")
    public Booking updateArrivalTime(@PathVariable Long bookingId, @RequestParam String estimatedTime) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setEstimatedArrivalTime(estimatedTime);
        
        // Calculate estimated arrival date/time (current time + estimated time)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime estimatedArrival = calculateArrivalTime(now, estimatedTime);
        booking.setEstimatedArrivalDateTime(estimatedArrival);
        
        return bookingRepo.save(booking);
    }
    
    private java.time.LocalDateTime calculateArrivalTime(java.time.LocalDateTime now, String estimatedTime) {
        // Parse estimated time and add to current time
        // Support formats like "30 minutes", "1 hour", "2 hours 30 minutes"
        try {
            estimatedTime = estimatedTime.toLowerCase().trim();
            
            if (estimatedTime.contains("hour") && estimatedTime.contains("minute")) {
                // Format: "2 hours 30 minutes"
                String[] parts = estimatedTime.split("\\s+");
                int hours = 0, minutes = 0;
                for (int i = 0; i < parts.length; i++) {
                    if (parts[i].contains("hour") && i > 0) {
                        hours = Integer.parseInt(parts[i-1]);
                    }
                    if (parts[i].contains("minute") && i > 0) {
                        minutes = Integer.parseInt(parts[i-1]);
                    }
                }
                return now.plusHours(hours).plusMinutes(minutes);
            } else if (estimatedTime.contains("hour")) {
                // Format: "2 hours"
                String[] parts = estimatedTime.split("\\s+");
                for (int i = 0; i < parts.length; i++) {
                    if (parts[i].contains("hour") && i > 0) {
                        int hours = Integer.parseInt(parts[i-1]);
                        return now.plusHours(hours);
                    }
                }
            } else if (estimatedTime.contains("minute")) {
                // Format: "30 minutes"
                String[] parts = estimatedTime.split("\\s+");
                for (int i = 0; i < parts.length; i++) {
                    if (parts[i].contains("minute") && i > 0) {
                        int minutes = Integer.parseInt(parts[i-1]);
                        return now.plusMinutes(minutes);
                    }
                }
            }
            
            // Default: assume it's just a number in minutes
            int minutes = Integer.parseInt(estimatedTime.replaceAll("[^0-9]", ""));
            return now.plusMinutes(minutes);
            
        } catch (Exception e) {
            // Default to 30 minutes if parsing fails
            return now.plusMinutes(30);
        }
    }
}