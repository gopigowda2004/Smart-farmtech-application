package com.farmtech.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment; // The equipment being booked

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private Farmer owner; // Owner of equipment (default owner that was booked)

    @ManyToOne(optional = false)
    @JoinColumn(name = "renter_id")
    private Farmer renter; // Farmer who is booking (buyer)

    @ManyToOne
    @JoinColumn(name = "accepted_owner_id")
    private Farmer acceptedOwner; // Owner who accepted the booking (may differ from original owner)

    private LocalDate startDate;
    private LocalDate endDate;

    // Store duration in hours for accuracy when renter books by hours
    private Integer hours;

    private String status; // PENDING, CONFIRMED, CANCELLED

    private String location; // Address where equipment is needed

    private Double locationLatitude;

    private Double locationLongitude;

    private Double totalCost; // Total cost of the booking
    
    private String estimatedArrivalTime; // Time estimation provided by owner (e.g., "30 minutes", "1 hour")
    
    private java.time.LocalDateTime estimatedArrivalDateTime; // Calculated arrival date/time

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    private java.time.LocalDateTime confirmedAt;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public Farmer getOwner() { return owner; }
    public void setOwner(Farmer owner) { this.owner = owner; }

    public Farmer getRenter() { return renter; }
    public void setRenter(Farmer renter) { this.renter = renter; }

    public Farmer getAcceptedOwner() { return acceptedOwner; }
    public void setAcceptedOwner(Farmer acceptedOwner) { this.acceptedOwner = acceptedOwner; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getHours() { return hours; }
    public void setHours(Integer hours) { this.hours = hours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLocationLatitude() { return locationLatitude; }
    public void setLocationLatitude(Double locationLatitude) { this.locationLatitude = locationLatitude; }

    public Double getLocationLongitude() { return locationLongitude; }
    public void setLocationLongitude(Double locationLongitude) { this.locationLongitude = locationLongitude; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(java.time.LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getEstimatedArrivalTime() { return estimatedArrivalTime; }
    public void setEstimatedArrivalTime(String estimatedArrivalTime) { this.estimatedArrivalTime = estimatedArrivalTime; }

    public java.time.LocalDateTime getEstimatedArrivalDateTime() { return estimatedArrivalDateTime; }
    public void setEstimatedArrivalDateTime(java.time.LocalDateTime estimatedArrivalDateTime) { this.estimatedArrivalDateTime = estimatedArrivalDateTime; }
}