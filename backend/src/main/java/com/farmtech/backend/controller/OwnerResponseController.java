package com.farmtech.backend.controller;

import com.farmtech.backend.entity.Booking;
import com.farmtech.backend.entity.BookingCandidate;
import com.farmtech.backend.repository.BookingCandidateRepository;
import com.farmtech.backend.service.CandidateDispatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/owner-responses")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerResponseController {

    private final BookingCandidateRepository candidateRepository;
    private final CandidateDispatchService candidateDispatchService;

    public OwnerResponseController(BookingCandidateRepository candidateRepository,
                                   CandidateDispatchService candidateDispatchService) {
        this.candidateRepository = candidateRepository;
        this.candidateDispatchService = candidateDispatchService;
    }

    @PostMapping("/{candidateId}/accept")
    @Transactional
    public ResponseEntity<OwnerResponsePayload> acceptCandidate(@PathVariable Long candidateId,
                                                                Principal principal) {
        BookingCandidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        assertOwnerAccess(principal, candidate);

        Booking booking = candidateDispatchService.markAccepted(candidate);

        OwnerResponsePayload payload = OwnerResponsePayload.from(booking, candidate, null);
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/{candidateId}/reject")
    @Transactional
    public ResponseEntity<OwnerResponsePayload> rejectCandidate(@PathVariable Long candidateId,
                                                                Principal principal) {
        BookingCandidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        assertOwnerAccess(principal, candidate);

        candidateDispatchService.markRejected(candidate);
        OwnerResponsePayload payload = OwnerResponsePayload.from(candidate.getBooking(), candidate, null);
        return ResponseEntity.ok(payload);
    }

    private void assertOwnerAccess(Principal principal, BookingCandidate candidate) {
        // Placeholder: integrate with authentication once available
        // If principal is required, ensure the candidate owner matches the authenticated user
    }

    public static class OwnerResponsePayload {
        private Booking booking;
        private BookingCandidate handledCandidate;
        private BookingCandidate nextCandidate;

        public static OwnerResponsePayload from(Booking booking,
                                                BookingCandidate handledCandidate,
                                                BookingCandidate nextCandidate) {
            OwnerResponsePayload payload = new OwnerResponsePayload();
            payload.setBooking(booking);
            payload.setHandledCandidate(handledCandidate);
            payload.setNextCandidate(nextCandidate);
            return payload;
        }

        public Booking getBooking() {
            return booking;
        }

        public void setBooking(Booking booking) {
            this.booking = booking;
        }

        public BookingCandidate getHandledCandidate() {
            return handledCandidate;
        }

        public void setHandledCandidate(BookingCandidate handledCandidate) {
            this.handledCandidate = handledCandidate;
        }

        public BookingCandidate getNextCandidate() {
            return nextCandidate;
        }

        public void setNextCandidate(BookingCandidate nextCandidate) {
            this.nextCandidate = nextCandidate;
        }
    }
}