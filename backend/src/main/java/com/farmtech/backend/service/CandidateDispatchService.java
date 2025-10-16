package com.farmtech.backend.service;

import com.farmtech.backend.entity.Booking;
import com.farmtech.backend.entity.BookingCandidate;
import com.farmtech.backend.entity.BookingCandidate.CandidateStatus;
import com.farmtech.backend.repository.BookingCandidateRepository;
import com.farmtech.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CandidateDispatchService {

    private final BookingCandidateRepository candidateRepository;
    private final BookingRepository bookingRepository;

    public CandidateDispatchService(BookingCandidateRepository candidateRepository,
                                    BookingRepository bookingRepository) {
        this.candidateRepository = candidateRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public void notifyCandidatesSimultaneously(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getAcceptedOwner() != null) {
            return;
        }

        List<BookingCandidate> notifiedCandidates = candidateRepository.findCandidatesForStatuses(
                booking,
                List.of(CandidateStatus.NOTIFIED)
        );

        if (notifiedCandidates.isEmpty()) {
            booking.setStatus("PENDING_NO_CANDIDATES");
            bookingRepository.save(booking);
            return;
        }

        booking.setStatus("AWAITING_OWNER");
        bookingRepository.save(booking);
        // TODO: trigger real-time notifications or SMS here
    }

    @Transactional
    public Booking markAccepted(BookingCandidate candidate) {
        Booking booking = candidate.getBooking();

        if (booking.getAcceptedOwner() != null) {
            throw new IllegalStateException("Booking is already confirmed with another owner");
        }

        candidate.setStatus(CandidateStatus.ACCEPTED);
        candidate.setRespondedAt(LocalDateTime.now());
        candidateRepository.save(candidate);

        booking.setAcceptedOwner(candidate.getOwner());
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        revokeOtherCandidates(booking, candidate.getId());
        return booking;
    }

    @Transactional
    public void markRejected(BookingCandidate candidate) {
        candidate.setStatus(CandidateStatus.REJECTED);
        candidate.setRespondedAt(LocalDateTime.now());
        candidateRepository.save(candidate);
    }

    private void revokeOtherCandidates(Booking booking, Long acceptedCandidateId) {
        LocalDateTime now = LocalDateTime.now();
        candidateRepository.findByBookingOrderByDistanceKmAsc(booking).stream()
                .filter(other -> !other.getId().equals(acceptedCandidateId))
                .forEach(other -> {
                    if (other.getStatus() == CandidateStatus.NOTIFIED) {
                        other.setStatus(CandidateStatus.SKIPPED_TIMEOUT);
                        other.setRespondedAt(now);
                    } else if (other.getStatus() == CandidateStatus.PENDING) {
                        other.setStatus(CandidateStatus.SKIPPED_TIMEOUT);
                        other.setInvitedAt(now);
                        other.setRespondedAt(now);
                    }
                    candidateRepository.save(other);
                });
    }
}