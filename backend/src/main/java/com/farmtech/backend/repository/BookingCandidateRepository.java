package com.farmtech.backend.repository;

import com.farmtech.backend.entity.Booking;
import com.farmtech.backend.entity.BookingCandidate;
import com.farmtech.backend.entity.BookingCandidate.CandidateStatus;
import com.farmtech.backend.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingCandidateRepository extends JpaRepository<BookingCandidate, Long> {

    List<BookingCandidate> findByBookingOrderByDistanceKmAsc(Booking booking);

    Optional<BookingCandidate> findFirstByBookingAndStatusOrderByInvitedAtAsc(Booking booking, CandidateStatus status);

    Optional<BookingCandidate> findFirstByBookingAndStatusInOrderByInvitedAtAsc(Booking booking, List<CandidateStatus> statuses);

    Optional<BookingCandidate> findFirstByBookingOrderByInvitedAtAsc(Booking booking);

    @Query("SELECT bc FROM BookingCandidate bc WHERE bc.booking = :booking AND bc.status IN :statuses ORDER BY bc.invitedAt ASC")
    List<BookingCandidate> findCandidatesForStatuses(@Param("booking") Booking booking,
                                                     @Param("statuses") List<CandidateStatus> statuses);

    Optional<BookingCandidate> findByBookingAndOwner(Booking booking, Farmer owner);
    
    // Find all candidates for a specific owner by status
    List<BookingCandidate> findByOwnerIdAndStatus(Long ownerId, CandidateStatus status);
    
    // Find all candidates for a specific owner (all statuses)
    List<BookingCandidate> findByOwnerIdOrderByInvitedAtDesc(Long ownerId);
    
    // Find pending candidates for a specific owner (NOTIFIED status)
    List<BookingCandidate> findByOwnerIdAndStatusOrderByInvitedAtAsc(Long ownerId, CandidateStatus status);
    
    // Find all candidates for a specific booking
    List<BookingCandidate> findByBookingId(Long bookingId);
}