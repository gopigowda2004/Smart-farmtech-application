package com.farmtech.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_candidates")
public class BookingCandidate {

    public enum CandidateStatus {
        PENDING,
        NOTIFIED,
        ACCEPTED,
        REJECTED,
        SKIPPED_TIMEOUT,
        EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private Farmer owner;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.PENDING;

    private LocalDateTime invitedAt;

    private LocalDateTime respondedAt;
    
    private LocalDateTime acceptedAt;
    
    private LocalDateTime expiredAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Farmer getOwner() {
        return owner;
    }

    public void setOwner(Farmer owner) {
        this.owner = owner;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public CandidateStatus getStatus() {
        return status;
    }

    public void setStatus(CandidateStatus status) {
        this.status = status;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(LocalDateTime expiredAt) {
        this.expiredAt = expiredAt;
    }
}